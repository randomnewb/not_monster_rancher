import {
  Colors,
  Events,
  grassTileColors,
  stoneTileColors,
  playerColors,
  walkableTiles,
  obstructionTiles,
} from "../utils/constants.js";
import data from "../data/data.js";
import Entity from "./entityClass.js";
import HealthBar from "./healthBarClass.js";
import EasyStar from "easystarjs";
import TileMetaData from "../utils/TileMetaData.js";
import StateMachine from "./stateMachineClass.js";

export default class Player extends Entity {
  constructor(scene, x, y, key, frame) {
    super(scene, x, y, key, frame);

    this.max_health = 100;
    this.current_health = this.max_health;
    this.healthBar = new HealthBar(scene, x, y, this.max_health);

    this.min_attack = 1;
    this.max_attack = 3;
    this.speed = 50;

    this.level = 1;
    this.experience = 0;

    this.woodcutting_level = 1;
    this.woodcutting_power_min = 20;
    this.woodcutting_power_max = 30;
    this.woodcuttingCounter = 0;
    this.woodcuttingCounterMax = 100;

    this.invincibilityCounter = 0;
    this.invincibilityCounterMax = 45;

    this.cooldownCounter = 0;
    this.cooldownCounterMax = 100;

    this.attacking = false;
    this.woodcutting = false;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(8, 8);
    this.setCollideWorldBounds();

    // position the player on an open tile
    this.scene.events.on(Events.MapArrayReady, openTile => {
      this.x = openTile.x * this.tileWidth + this.tileWidth / 2;
      this.y = openTile.y * this.tileHeight + this.tileHeight / 2;
    });

    // this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,J,K,L,I");
    this.collectedJewels = 0;

    this.originalTint =
      playerColors[Math.floor(Math.random() * playerColors.length)];

    this.setTint(this.originalTint);

    this.facing = "down";
    this.tileBeingLookedAt = null;
    this.isClickToMove = false;

    this.tileWidth = 16;
    this.tileHeight = 16;

    this.highlights = [];
    this.highlight = this.scene.add.graphics({
      fillStyle: { color: Colors.White },
    });
    this.highlight.alpha = 0.2; // make it semi-transparent

    this.targetPosition = null;
    this.isPathfinding = false;

    this.easystar = new EasyStar.js();
    this.scene.events.on(Events.MapArrayReady, () => {
      this.easystar.setGrid(data.currentMapArray);
    });

    this.easystar.setAcceptableTiles(walkableTiles);
    this.easystar.setIterationsPerCalculation(1000);
    this.easystar.disableCornerCutting();

    // Initialize the timed event
    this.timedEvent = null;

    this.createBounceTween();

    // Store the last clicked tile coordinates
    this.lastClickedTile = null;

    this.scene.input.on("pointerdown", this.clickedTileData.bind(this));

    this.states = {
      idle: {
        enter: () => {
          console.log("Player entered idle state");
        },
        execute: () => {
          console.log("Player is idle");
        },
        exit: () => {
          console.log("Player exited idle state");
        },
      },
      attacking: {
        enter: () => {
          console.log("Player entered attacking state");
        },
        execute: () => {
          console.log("Player is attacking");
        },
        exit: () => {
          console.log("Player exited attacking state");
        },
      },
      woodcutting: {
        enter: () => {
          console.log("Player entered woodcutting state");
        },
        execute: () => {
          console.log("Player is woodcutting");
        },
        exit: () => {
          console.log("Player exited woodcutting state");
        },
      },
      moving: {
        enter: () => {
          console.log("Player entered moving state");
        },
        execute: () => {
          console.log("Player is moving");
        },
        exit: () => {
          console.log("Player exited moving state");
        },
      },
      damaged: {
        enter: () => {
          console.log("Player entered damaged state");
        },
        execute: () => {
          console.log("Player is damaged");
        },
        exit: () => {
          console.log("Player exited damaged state");
        },
      },
    };

    this.stateMachine = new StateMachine("idle", this.states, [this]);
  }

  clickedTileData(pointer) {
    let tileXY = this.handlePointerDown(pointer);

    if (tileXY === null) {
      return;
    }

    console.log(`Pointer position: x = ${pointer.x}, y = ${pointer.y}`);
    console.log(`Tile coordinates: x = ${tileXY.x}, y = ${tileXY.y}`);

    if (
      tileXY.x >= 0 &&
      tileXY.x < this.scene.terrain.map.width &&
      tileXY.y >= 0 &&
      tileXY.y < this.scene.terrain.map.height
    ) {
      let tile = this.scene.terrain.map.getTileAt(tileXY.x, tileXY.y);

      let metadata = this.scene.terrain.TileMetaData.get(tile);

      console.log(
        `Tile clicked: x = ${tileXY.x}, y = ${tileXY.y}, metadata = `,
        metadata
      );
    } else {
      console.log("Tile coordinates are outside the bounds of the map");
    }
  }

  keyPressedTileData() {
    let tileXY = this.tileBeingLookedAt;

    if (this.tileBeingLookedAt === null) {
      return;
    }

    console.log(`Tile coordinates: x = ${tileXY.x}, y = ${tileXY.y}`);

    if (
      tileXY.x >= 0 &&
      tileXY.x < this.scene.terrain.map.width &&
      tileXY.y >= 0 &&
      tileXY.y < this.scene.terrain.map.height
    ) {
      let tile = this.scene.terrain.map.getTileAt(tileXY.x, tileXY.y);

      let metadata = this.scene.terrain.TileMetaData.get(tile);

      console.log(
        `Tile looked at: x = ${tileXY.x}, y = ${tileXY.y}, metadata = `,
        metadata
      );
    } else {
      console.log("Tile coordinates are outside the bounds of the map");
    }
  }

  handlePointerDown(pointer) {
    let { worldPoint, tileXY } = this.getTileCoordinates(pointer);

    if (
      this.targetTile &&
      this.targetTile.x === tileXY.x &&
      this.targetTile.y === tileXY.y
    ) {
      return null;
    }

    this.targetTile = tileXY;

    this.lastClickedTile = tileXY;

    if (this.isTileWithinGrid(tileXY)) {
      if (this.timedEvent) {
        this.timedEvent.remove();
        this.timedEvent = null;
      }

      let tempMapArray = JSON.parse(JSON.stringify(data.currentMapArray));

      // Temporarily change the obstruction tile that the player clicked on to a walkable tile in the copy of the map array
      let tile = this.scene.terrain.map.getTileAt(tileXY.x, tileXY.y);
      if (tile && obstructionTiles.includes(tile.index)) {
        tempMapArray[tile.y][tile.x] = walkableTiles[0]; // Change the tile to the first walkable tile
        this.easystar.setGrid(tempMapArray); // Use the modified map array for the pathfinding algorithm
      }

      // Find a path to the clicked tile
      this.easystar.findPath(
        this.playerTileX,
        this.playerTileY,
        tileXY.x,
        tileXY.y,
        path => {
          if (path === null) {
          } else {
            this.path = path;

            if (tile && obstructionTiles.includes(tile.index)) {
              this.path.pop();
            }

            this.moveAlongPath(this.path);
          }
        }
      );

      this.easystar.calculate();
    }

    worldPoint = this.scene.terrain.map.tileToWorldXY(tileXY.x, tileXY.y);

    this.drawRectangle(worldPoint);

    worldPoint.x += this.tileWidth / 2;
    worldPoint.y += this.tileHeight / 2;

    this.targetPosition = worldPoint;

    let direction = this.calculateDirection(
      this.targetPosition.x,
      this.targetPosition.y
    );

    this.updateFacingDirection(direction);

    return tileXY;
  }

  handleKeyboardMovement(targetX, targetY) {
    this.currentPath = [];
    // Convert the world coordinates to tile coordinates
    let tileXY = this.scene.terrain.map.worldToTileXY(targetX, targetY);

    if (this.isTileWithinGrid(tileXY)) {
      if (this.timedEvent) {
        this.timedEvent.remove();
        this.timedEvent = null;
      }

      // Only initiate the pathfinding process if it's not already ongoing
      if (!this.isPathfinding && !this.isClickToMove) {
        this.isPathfinding = true;

        this.easystar.findPath(
          this.playerTileX,
          this.playerTileY,
          tileXY.x,
          tileXY.y,
          path => {
            if (path === null) {
              this.isPathfinding = false;
            } else {
              this.path = path;
              this.moveAlongPath(path);
            }
          }
        );

        this.easystar.calculate();
      }
    }

    let worldPoint = this.scene.terrain.map.tileToWorldXY(tileXY.x, tileXY.y);

    this.drawRectangle(worldPoint);

    worldPoint.x += this.tileWidth / 2;
    worldPoint.y += this.tileHeight / 2;

    this.targetPosition = worldPoint;

    let direction = this.calculateDirection(
      this.targetPosition.x,
      this.targetPosition.y
    );

    this.updateFacingDirection(direction);
  }

  calculateDirection(targetX, targetY) {
    let directionX = targetX - this.x;
    let directionY = targetY - this.y;

    // Normalize the direction
    let length = Math.sqrt(directionX * directionX + directionY * directionY);
    return {
      x: directionX / length,
      y: directionY / length,
    };
  }

  updateFacingDirection(direction) {
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      this.facing = direction.x > 0 ? "right" : "left";
    } else {
      this.facing = direction.y > 0 ? "down" : "up";
    }

    // Update the tile being looked at based on the new facing direction
    switch (this.facing) {
      case "up":
        this.tileBeingLookedAt = {
          x: this.playerTileX,
          y: this.playerTileY - 1,
        };
        break;
      case "down":
        this.tileBeingLookedAt = {
          x: this.playerTileX,
          y: this.playerTileY + 1,
        };
        break;
      case "left":
        this.tileBeingLookedAt = {
          x: this.playerTileX - 1,
          y: this.playerTileY,
        };
        break;
      case "right":
        this.tileBeingLookedAt = {
          x: this.playerTileX + 1,
          y: this.playerTileY,
        };
        break;
    }
  }

  moveAlongPath(path) {
    this.body.setVelocity(0);

    // Guard clause in case no path given
    if (!path || path.length === 0) {
      this.stateMachine.transition("idle");
      this.isPathfinding = false;

      if (this.highlight) {
        this.highlight.clear();
      }
      return;
    }

    this.stateMachine.transition("moving");

    this.currentPath = path;

    const nextTile = this.currentPath.shift();
    this.targetWorldPoint = this.scene.terrain.map.tileToWorldXY(
      nextTile.x,
      nextTile.y
    );

    this.targetWorldPoint.x += this.tileWidth / 2;
    this.targetWorldPoint.y += this.tileHeight / 2;

    this.scene.physics.moveTo(
      this,
      this.targetWorldPoint.x,
      this.targetWorldPoint.y,
      this.speed
    );

    let direction = this.calculateDirection(
      this.targetWorldPoint.x,
      this.targetWorldPoint.y
    );

    this.updateFacingDirection(direction);

    if (this.currentPath.length === 0) {
      let tileXY = { x: nextTile.x, y: nextTile.y };
      if (this.isTileWithinGrid(tileXY)) {
        this.replaceTreeWithRandomTile(tileXY);
      }

      this.easystar.setAcceptableTiles(walkableTiles);
    }
  }

  calculateTargetPositionAndDirection(worldPoint) {
    worldPoint.x += this.tileWidth / 2;
    worldPoint.y += this.tileHeight / 2;

    this.targetPosition = worldPoint;

    let direction = this.calculateDirection(
      this.targetPosition.x,
      this.targetPosition.y
    );

    return direction;
  }

  getTileCoordinates(pointer) {
    // Get the position of the mouse click relative to the game canvas
    let pointerX = pointer.downX;
    let pointerY = pointer.downY;

    // Convert the screen coordinates to world coordinates
    let worldPoint = this.scene.cameras.main.getWorldPoint(pointerX, pointerY);

    // Convert the world coordinates to tile coordinates
    let tileXY = this.scene.terrain.map.worldToTileXY(
      worldPoint.x,
      worldPoint.y
    );

    return { worldPoint, tileXY };
  }

  isTileWithinGrid(tileXY) {
    return (
      tileXY.x >= 0 &&
      tileXY.y >= 0 &&
      tileXY.x < this.scene.terrain.map.width &&
      tileXY.y < this.scene.terrain.map.height
    );
  }

  isNextTo(tileXY) {
    let playerTileXY = this.scene.terrain.map.worldToTileXY(this.x, this.y);
    return (
      (Math.abs(playerTileXY.x - tileXY.x) === 1 &&
        playerTileXY.y === tileXY.y) ||
      (Math.abs(playerTileXY.y - tileXY.y) === 1 && playerTileXY.x === tileXY.x)
    );
  }

  update(
    isWDown,
    isADown,
    isSDown,
    isDDown,
    isIDown,
    isJDown,
    isKDown,
    isLDown
  ) {
    if (this.targetPosition) {
      let direction = this.calculateDirection(
        this.targetPosition.x,
        this.targetPosition.y
      );

      this.updateFacingDirection(direction);
    }

    if (
      this.lastClickedTile &&
      this.isNextTo(this.lastClickedTile) &&
      this.woodcuttingCounter <= 0
    ) {
      let tile = this.scene.terrain.map.getTileAt(
        this.lastClickedTile.x,
        this.lastClickedTile.y
      );

      if (tile && obstructionTiles.includes(tile.index)) {
        this.decreaseTileHealth(this.lastClickedTile);
        this.woodcuttingCounter = this.woodcuttingCounterMax;
      }
    }

    this.drawTileBeingLookedAt();

    if (
      this.stateMachine.stateName === "attacking" &&
      this.cooldownCounter <= 0
    ) {
      this.cooldownCounter = this.cooldownCounterMax;
    }

    if (this.cooldownCounter > 0) {
      this.cooldownCounter--;
    }

    if (this.woodcuttingCounter > 0) {
      this.woodcuttingCounter--;
    }

    if (this.invincibilityCounter > 0) {
      this.invincibilityCounter--;
      // Create a flashing effect by alternating the tint
      if (this.invincibilityCounter % 2 == 0) {
        this.setTint(Colors.White);
      } else {
        this.setTint(this.originalTint);
      }
    } else {
      this.setTint(this.originalTint);
    }
    this.playerTileX = Math.floor(this.x / this.tileWidth);
    this.playerTileY = Math.floor(this.y / this.tileHeight);

    if (this.stateMachine.stateName !== "moving") {
      this.body.setVelocity(0);
    }

    if (this.stateMachine.stateName === "moving" && this.targetWorldPoint) {
      let direction = this.calculateDirection(
        this.targetWorldPoint.x,
        this.targetWorldPoint.y
      );

      // Check if the player is moving in the opposite direction
      if (
        (direction.x > 0 && this.body.velocity.x < 0) ||
        (direction.x < 0 && this.body.velocity.x > 0) ||
        (direction.y > 0 && this.body.velocity.y < 0) ||
        (direction.y < 0 && this.body.velocity.y > 0)
      ) {
        // Reset the player's velocity to move it back towards the target point
        this.scene.physics.moveTo(
          this,
          this.targetWorldPoint.x,
          this.targetWorldPoint.y,
          this.speed
        );
      }

      if (
        Phaser.Math.Distance.Between(
          this.x,
          this.y,
          this.targetWorldPoint.x,
          this.targetWorldPoint.y
        ) < 3
      ) {
        // Close enough to tile so stop pathfinding process to the current tile
        this.body.setVelocity(0);
        this.isClickToMove = false;
        this.targetWorldPoint = null;

        // continue moving along the path (if any tiles left)
        this.moveAlongPath(this.currentPath);
      }
    }

    this.easystar.calculate();

    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    if (isWDown) {
      let targetY = this.y - this.tileHeight;
      this.handleKeyboardMovement(this.x, targetY);
    } else if (isSDown) {
      let targetY = this.y + this.tileHeight;
      this.handleKeyboardMovement(this.x, targetY);
    }

    if (isADown) {
      let targetX = this.x - this.tileWidth;
      this.handleKeyboardMovement(targetX, this.y);
    } else if (isDDown) {
      let targetX = this.x + this.tileWidth;
      this.handleKeyboardMovement(targetX, this.y);
    }

    if (isIDown) {
    }

    if (isJDown) {
      if (this.stateMachine.stateName !== "attacking") {
        this.stateMachine.transition("attacking");
        this.isPathfinding = false;
        this.currentPath = [];
      } else {
        this.stateMachine.transition("idle");
      }
    }

    if (isKDown) {
      this.woodcutting = !this.woodcutting;

      if (this.woodcutting) {
        this.keyPressedTileData();
        let tile = this.scene.terrain.map.getTileAt(
          this.tileBeingLookedAt.x,
          this.tileBeingLookedAt.y
        );

        let metadata = this.scene.terrain.TileMetaData.get(tile);

        if (tile && obstructionTiles.includes(tile.index)) {
          metadata.health -= Phaser.Math.Between(
            this.woodcutting_power_min,
            this.woodcutting_power_max
          );

          if (metadata.health <= 0) {
            this.replaceTreeWithRandomTile(this.tileBeingLookedAt);
          }
        }
      }
    }

    if (isLDown) {
      this.takeDamage(1);
      console.log(this.current_health);
    }

    this.healthBar.setPosition(this.x, this.y + 12);

    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      if (!this.bounceTween.isPlaying()) {
        this.bounceTween.resume();
      }
    } else {
      if (this.bounceTween.isPlaying()) {
        this.bounceTween.pause();
      }
    }
  }

  replaceTreeWithRandomTile(tileXY) {
    let tile = this.scene.terrain.map.getTileAt(tileXY.x, tileXY.y);
    if (tile && obstructionTiles.includes(tile.index)) {
      let metadata = this.scene.terrain.TileMetaData.get(tile);

      if (metadata.health <= 0) {
        let newTileIndex = Phaser.Math.Between(0, 7);
        let newTile = this.scene.terrain.layer.putTileAt(
          newTileIndex,
          tile.x,
          tile.y
        );

        this.scene.terrain.TileMetaData.delete(tile);

        const tilesetImage = "Assets.FoliageTiles";
        const lifeSkillsType = "none";
        const health = 0;
        const durability = 0;
        const newMetadata = new TileMetaData(
          tilesetImage,
          newTileIndex,
          lifeSkillsType,
          health,
          durability
        );
        this.scene.terrain.TileMetaData.set(newTile, newMetadata);

        if ([1, 5, 6, 7].includes(newTileIndex)) {
          newTile.tint = Phaser.Math.RND.pick(grassTileColors);
        } else if ([2, 3, 4].includes(newTileIndex)) {
          newTile.tint = Phaser.Math.RND.pick(stoneTileColors);
        }
        newTile.alpha = 0.4;

        data.currentMapArray[tile.y][tile.x] = walkableTiles[0];
        this.easystar.setGrid(data.currentMapArray);
      } else {
        this.decreaseTileHealth(tileXY);
      }
    }
  }

  decreaseTileHealth(tileXY) {
    if (this.woodcuttingCounter <= 0) {
      let tile = this.scene.terrain.map.getTileAt(tileXY.x, tileXY.y);
      if (tile && obstructionTiles.includes(tile.index)) {
        let metadata = this.scene.terrain.TileMetaData.get(tile);

        let damage = Phaser.Math.Between(
          this.woodcutting_power_min,
          this.woodcutting_power_max
        );
        metadata.health -= damage;

        this.scene.terrain.TileMetaData.set(tile, metadata);

        if (metadata.health <= 0) {
          this.replaceTreeWithRandomTile(tileXY);
        }
      }
    }
  }

  drawRectangle(worldPoint) {
    if (this.highlight) {
      this.highlight.clear();
    }

    this.highlight.fillRect(
      worldPoint.x,
      worldPoint.y,
      this.tileWidth,
      this.tileHeight
    );
  }

  drawTileBeingLookedAt() {
    if (!this.tileBeingLookedAtGraphics) {
      this.tileBeingLookedAtGraphics = this.scene.add.graphics({
        lineStyle: { width: 2, color: 0x0000ff },
      });
    }

    this.tileBeingLookedAtGraphics.clear();

    if (this.tileBeingLookedAt) {
      let x = this.tileBeingLookedAt.x * this.tileWidth;
      let y = this.tileBeingLookedAt.y * this.tileHeight;
      this.tileBeingLookedAtGraphics.strokeRect(
        x,
        y,
        this.tileWidth,
        this.tileHeight
      );
    }
  }

  addExperiencePoints(monsterLevel) {
    let experienceGain = (monsterLevel - this.level) * 5;

    experienceGain = Math.max(1, Math.min(25, experienceGain));

    if (this.level >= monsterLevel + 5) {
      experienceGain = 0;
    }

    this.experience += experienceGain;

    if (this.experience >= 100) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.experience = 0;
    this.max_health += 20;
    this.current_health = this.max_health;
    this.min_attack += 1;
    this.max_attack += 1;
    this.speed += 10;

    this.healthBar.updateHealth(this.current_health);
    this.emit(Events.HealthChanged, this.current_health);
  }

  takeDamage(damage) {
    if (damage > 0) {
      if (this.invincibilityCounter <= 0) {
        this.current_health -= damage;
        if (this.current_health < 0) {
          this.current_health = 0;
          this.scene.gameOver();
        }
        if (this.current_health > this.max_health) {
          this.current_health = this.max_health;
        }
        this.healthBar.updateHealth(this.current_health);
        this.emit(Events.HealthChanged, this.current_health);
        if (this.invincibilityCounter <= 0) {
          this.invincibilityCounter = this.invincibilityCounterMax;
        }
        this.setTint(Colors.White);
      }
    } else {
      this.current_health -= damage;
      if (this.current_health > this.max_health) {
        this.current_health = this.max_health;
      }
      this.healthBar.updateHealth(this.current_health);
      this.emit(Events.HealthChanged, this.current_health);
    }
  }

  createBounceTween() {
    this.bounceTween = this.scene.tweens.add({
      targets: this,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      repeat: -1,
      paused: true,
    });
  }
}
