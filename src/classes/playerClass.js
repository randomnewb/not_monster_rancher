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

    this.invincibilityCounter = 0;
    this.invincibilityCounterMax = 45;

    this.cooldownCounter = 0;
    this.cooldownCounterMax = 100;

    this.attacking = false;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setCircle(5, 3.4, 4);
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
  }

  addExperiencePoints(monsterLevel) {
    let experienceGain = (monsterLevel - this.level) * 5;

    // Ensure the player gains at least 1 point, but no more than 25 points
    experienceGain = Math.max(1, Math.min(25, experienceGain));

    // If the player's level is equal to or more than 5 monster levels, no experience points are gained
    if (this.level >= monsterLevel + 5) {
      experienceGain = 0;
    }

    this.experience += experienceGain;

    if (this.experience >= 100) {
      this.levelUp();
    }

    // console.log(`Player gained ${experienceGain} experience points!`);
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

    // console.log(`Player leveled up to level ${this.level}!`);
  }

  handlePointerDown(pointer) {
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

    // Check if the clicked tile is the same as the current target tile
    if (
      this.targetTile &&
      this.targetTile.x === tileXY.x &&
      this.targetTile.y === tileXY.y
    ) {
      // The player is already moving to this tile, so return early
      return;
    }

    this.targetTile = tileXY;

    // Check if the tile coordinates are within the grid boundaries
    if (this.isTileWithinGrid(tileXY)) {
      // If a timed event is currently running, stop it
      if (this.timedEvent) {
        this.timedEvent.remove();
        this.timedEvent = null;
      }

      // Create a copy of the current map array
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
            // Save the path for later
            this.path = path;
            this.moveAlongPath(path);
          }
        }
      );

      // Don't forget to calculate the pathfinding!
      this.easystar.calculate();
    }

    // Convert the tile coordinates back to world coordinates
    worldPoint = this.scene.terrain.map.tileToWorldXY(tileXY.x, tileXY.y);

    // Draw a rectangle at the top-left corner of the clicked tile
    if (this.highlight) {
      this.highlight.clear();
    }

    this.highlight.fillRect(
      worldPoint.x,
      worldPoint.y,
      this.tileWidth,
      this.tileHeight
    );

    worldPoint.x += this.tileWidth / 2;
    worldPoint.y += this.tileHeight / 2;

    this.targetPosition = worldPoint;

    // Calculate the direction of the movement
    let direction = this.calculateDirection(
      this.targetPosition.x,
      this.targetPosition.y
    );

    // Update the facing direction based on the movement direction
    this.updateFacingDirection(direction);

    // Check if the clicked tile is a tree
    // this.replaceTreeWithRandomTile(tileXY);

    return tileXY;
  }

  handleKeyboardMovement(targetX, targetY) {
    this.currentPath = []; // Clear the current path
    // Convert the world coordinates to tile coordinates
    let tileXY = this.scene.terrain.map.worldToTileXY(targetX, targetY);

    // Check if the tile coordinates are within the grid boundaries
    if (this.isTileWithinGrid(tileXY)) {
      // If a timed event is currently running, stop it
      if (this.timedEvent) {
        this.timedEvent.remove();
        this.timedEvent = null;
      }

      // Check if the clicked tile is a tree
      this.replaceTreeWithRandomTile(tileXY);

      // Only initiate the pathfinding process if it's not already ongoing
      if (!this.isPathfinding && !this.isClickToMove) {
        this.isPathfinding = true;

        // Find a path to the target tile
        this.easystar.findPath(
          this.playerTileX,
          this.playerTileY,
          tileXY.x,
          tileXY.y,
          path => {
            if (path === null) {
              this.isPathfinding = false;
            } else {
              // Save the path for later
              this.path = path;
              this.moveAlongPath(path);
            }
          }
        );

        // Don't forget to calculate the pathfinding!
        this.easystar.calculate();
      }
    }
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
      // Horizontal movement
      this.facing = direction.x > 0 ? "right" : "left";
    } else {
      // Vertical movement
      this.facing = direction.y > 0 ? "down" : "up";
    }
  }

  moveAlongPath(path) {
    // Stop any previous movement
    this.body.setVelocity(0);

    // Guard clause in case no path given
    if (!path || path.length === 0) {
      this.isClickToMove = false;
      this.isPathfinding = false; // Reset the isPathfinding flag
      // Clear the highlight
      if (this.highlight) {
        this.highlight.clear();
      }
      return;
    }

    // Activate moving flag
    this.isClickToMove = true;

    this.currentPath = path;

    const nextTile = this.currentPath.shift();
    this.targetWorldPoint = this.scene.terrain.map.tileToWorldXY(
      nextTile.x,
      nextTile.y
    );

    // Adding half of the tile's width and height to place the target in the middle of the tile
    this.targetWorldPoint.x += this.tileWidth / 2;
    this.targetWorldPoint.y += this.tileHeight / 2;

    this.scene.physics.moveTo(
      this,
      this.targetWorldPoint.x,
      this.targetWorldPoint.y,
      this.speed
    );

    // Calculate the direction of the movement
    let direction = this.calculateDirection(
      this.targetWorldPoint.x,
      this.targetWorldPoint.y
    );

    // Update the facing direction based on the movement direction
    this.updateFacingDirection(direction);

    // If the next tile is the last one in the path and it's an obstruction tile, remove it
    if (this.currentPath.length === 0) {
      let tileXY = { x: nextTile.x, y: nextTile.y };
      if (this.isTileWithinGrid(tileXY)) {
        this.replaceTreeWithRandomTile(tileXY);
      }
      // Reset the acceptable tiles to the original walkable tiles
      this.easystar.setAcceptableTiles(walkableTiles);
    }
  }

  isTileWithinGrid(tileXY) {
    return (
      tileXY.x >= 0 &&
      tileXY.y >= 0 &&
      tileXY.x < this.scene.terrain.map.width &&
      tileXY.y < this.scene.terrain.map.height
    );
  }

  replaceTreeWithRandomTile(tileXY) {
    let tile = this.scene.terrain.map.getTileAt(tileXY.x, tileXY.y);
    if (tile && obstructionTiles.includes(tile.index)) {
      let newTileIndex = Phaser.Math.Between(0, 7);
      let newTile = this.scene.terrain.layer.putTileAt(
        newTileIndex,
        tile.x,
        tile.y
      );

      if ([1, 5, 6, 7].includes(newTileIndex)) {
        newTile.tint = Phaser.Math.RND.pick(grassTileColors);
      } else if ([2, 3, 4].includes(newTileIndex)) {
        newTile.tint = Phaser.Math.RND.pick(stoneTileColors);
      }
      newTile.alpha = 0.4;

      data.currentMapArray[tile.y][tile.x] = newTileIndex;
      this.easystar.setGrid(data.currentMapArray);
    }
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
    if (this.attacking && this.cooldownCounter <= 0) {
      this.cooldownCounter = this.cooldownCounterMax;
    }
    // Decrease cooldown counter if it's greater than 0
    if (this.cooldownCounter > 0) {
      this.cooldownCounter--;
    }

    // Decrease invincibility counter if it's greater than 0
    if (this.invincibilityCounter > 0) {
      this.invincibilityCounter--;
      // Create a flashing effect by alternating the tint
      if (this.invincibilityCounter % 2 == 0) {
        this.setTint(Colors.White);
      } else {
        this.setTint(this.originalTint);
      }
    } else {
      // Reset the tint to the original color
      this.setTint(this.originalTint);
    }
    // Update player's tile coordinates
    this.playerTileX = Math.floor(this.x / this.tileWidth);
    this.playerTileY = Math.floor(this.y / this.tileHeight);

    if (!this.isClickToMove) {
      this.body.setVelocity(0);
    }

    if (this.isClickToMove && this.targetWorldPoint) {
      // Calculate the direction to the target point
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

    // Calculate the pathfindings
    this.easystar.calculate();

    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    // Vertical movement
    if (isWDown) {
      // Calculate new target position
      let targetY = this.y - this.tileHeight;
      this.handleKeyboardMovement(this.x, targetY);
    } else if (isSDown) {
      // Calculate new target position
      let targetY = this.y + this.tileHeight;
      this.handleKeyboardMovement(this.x, targetY);
    }

    // Horizontal movement
    if (isADown) {
      // Calculate new target position
      let targetX = this.x - this.tileWidth;
      this.handleKeyboardMovement(targetX, this.y);
    } else if (isDDown) {
      // Calculate new target position
      let targetX = this.x + this.tileWidth;
      this.handleKeyboardMovement(targetX, this.y);
    }

    // Future Actions to Implement
    if (isIDown) {
    }

    if (isJDown) {
      this.attacking = !this.attacking;
    }

    if (isKDown) {
    }

    if (isLDown) {
      this.takeDamage(1);
      console.log(this.current_health);
    }

    this.healthBar.setPosition(this.x, this.y + 12);

    // Check if the player has velocity
    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      // If the player is moving and the tween is not active, start the tween
      if (!this.bounceTween.isPlaying()) {
        this.bounceTween.resume();
      }
    } else {
      // If the player is not moving and the tween is active, stop the tween
      if (this.bounceTween.isPlaying()) {
        this.bounceTween.pause();
      }
    }
  }

  takeDamage(damage) {
    if (damage > 0) {
      // Only take damage if not invincible
      if (this.invincibilityCounter <= 0) {
        this.current_health -= damage;
        // Check if health is less than 0 and set it to 0
        if (this.current_health < 0) {
          this.current_health = 0;
          this.scene.gameOver();
        }
        // Check if health is more than max and set it to max
        if (this.current_health > this.max_health) {
          this.current_health = this.max_health;
        }
        this.healthBar.updateHealth(this.current_health);
        this.emit(Events.HealthChanged, this.current_health);
        // Set invincibility counter only if it's not currently running
        if (this.invincibilityCounter <= 0) {
          this.invincibilityCounter = this.invincibilityCounterMax;
        }
        this.setTint(Colors.White);
      }
    } else {
      this.current_health -= damage;
      // Check if health is more than max and set it to max
      if (this.current_health > this.max_health) {
        this.current_health = this.max_health;
      }
      this.healthBar.updateHealth(this.current_health);
      this.emit(Events.HealthChanged, this.current_health);
    }
  }

  createBounceTween() {
    // simple bounce animation tween
    this.bounceTween = this.scene.tweens.add({
      targets: this,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      repeat: -1,
      paused: true, // Start with the tween paused
    });
  }
}
