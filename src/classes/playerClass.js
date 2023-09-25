import data from "../data/data.js";
import Entity from "./entityClass.js";
import HealthBar from "./healthBarClass.js";
import EasyStar from "easystarjs";

export default class Player extends Entity {
  constructor(scene, x, y, key, frame) {
    super(scene, x, y, key, frame);

    // // If a position was provided, use it
    // if (position) {
    //   this.x = position.x;
    //   this.y = position.y;
    // }

    this.max_health = 100;
    this.current_health = this.max_health;
    this.healthBar = new HealthBar(scene, x, y, this.max_health);

    this.min_attack = 1;
    this.max_attack = 3;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setCircle(5, 3.4, 4);
    this.setCollideWorldBounds();

    // position the player on an open tile
    this.scene.events.on("mapArrayReady", openTile => {
      this.x = openTile.x * this.tileWidth + this.tileWidth / 2;
      this.y = openTile.y * this.tileHeight + this.tileHeight / 2;
    });

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,J,K,L,I");
    this.collectedJewels = 0;

    const playerColors = [
      0xddac46, 0xc25940, 0x683d64, 0x51b1ca, 0x1773b8, 0x639f5b, 0x376e49,
    ];

    this.tint = playerColors[Math.floor(Math.random() * playerColors.length)];
    this.facing = "down";
    this.isClickToMove = false;

    this.tileWidth = 16;
    this.tileHeight = 16;

    this.highlights = [];
    this.highlight = this.scene.add.graphics({
      fillStyle: { color: 0xffffff },
    });
    this.highlight.alpha = 0.2; // make it semi-transparent

    this.scene.input.on(
      "pointerdown",
      pointer => this.handlePointerDown(pointer, this.scene.terrain.map),
      this
    );

    this.targetPosition = null;
    this.isPathfinding = false;

    this.obstructionTiles = [8, 9, 10, 11, 12, 13];

    this.easystar = new EasyStar.js();
    this.scene.events.on("mapArrayReady", () => {
      this.easystar.setGrid(data.currentMapArray);
    });

    this.easystar.setAcceptableTiles([0, 1, 2, 3, 4, 5, 6, 7]);
    this.easystar.setIterationsPerCalculation(1000);
    // this.easystar.enableDiagonals();
    this.easystar.disableCornerCutting();

    // Initialize the timed event
    this.timedEvent = null;

    this.createBounceTween();
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

    // Check if the tile coordinates are within the grid boundaries
    if (
      tileXY.x >= 0 &&
      tileXY.y >= 0 &&
      tileXY.x < this.scene.terrain.map.width &&
      tileXY.y < this.scene.terrain.map.height
    ) {
      // If a timed event is currently running, stop it
      if (this.timedEvent) {
        this.timedEvent.remove();
        this.timedEvent = null;
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

    return tileXY;
  }

  handleKeyboardMovement(targetX, targetY) {
    // Convert the world coordinates to tile coordinates
    let tileXY = this.scene.terrain.map.worldToTileXY(targetX, targetY);

    // Check if the tile coordinates are within the grid boundaries
    if (
      tileXY.x >= 0 &&
      tileXY.y >= 0 &&
      tileXY.x < this.scene.terrain.map.width &&
      tileXY.y < this.scene.terrain.map.height
    ) {
      // If a timed event is currently running, stop it
      if (this.timedEvent) {
        this.timedEvent.remove();
        this.timedEvent = null;
      }

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

    const speed = 100; // Can be adjusted accordingly to your preference
    this.scene.physics.moveTo(
      this,
      this.targetWorldPoint.x,
      this.targetWorldPoint.y,
      speed
    );

    // Calculate the direction of the movement
    let direction = this.calculateDirection(
      this.targetWorldPoint.x,
      this.targetWorldPoint.y
    );

    // Update the facing direction based on the movement direction
    this.updateFacingDirection(direction);
  }

  takeDamage(damage) {
    this.current_health -= damage;
    // Check if health is less than 0 and set it to 0
    if (this.current_health < 0) {
      this.current_health = 0;
      this.scene.gameOver();
    }
    this.healthBar.updateHealth(this.current_health);

    this.emit("healthChanged", this.current_health);
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

  update() {
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
          100 // adjust speed as needed
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

    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    if (this.cursorKeys) {
      if (
        this.cursorKeys.left.isDown ||
        this.cursorKeys.right.isDown ||
        this.cursorKeys.up.isDown ||
        this.cursorKeys.down.isDown
      ) {
        this.targetPosition = null;
        this.highlight.clear(); // Clear the highlight
      }
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      // Calculate new target position
      let targetY = this.y - this.tileHeight;
      this.handleKeyboardMovement(this.x, targetY);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      // Calculate new target position
      let targetY = this.y + this.tileHeight;
      this.handleKeyboardMovement(this.x, targetY);
    }

    // Horizontal movement
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      // Calculate new target position
      let targetX = this.x - this.tileWidth;
      this.handleKeyboardMovement(targetX, this.y);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      // Calculate new target position
      let targetX = this.x + this.tileWidth;
      this.handleKeyboardMovement(targetX, this.y);
    }

    // Future Actions to Implement
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
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
}
