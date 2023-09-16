import data from "../data/data.js";
import Entity from "./entityClass.js";
import HealthBar from "./healthBarClass.js";
import EasyStar from "easystarjs";

export default class Player extends Entity {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.max_health = 100;
    this.current_health = this.max_health;
    this.healthBar = new HealthBar(scene, x, y, this.max_health);

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setCircle(8);
    this.setCollideWorldBounds();

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    // this.cursorKeys = this.scene.joystick.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,J,K,L,I");
    this.collectedJewels = 0;
    this.tint = 0x2986cc;
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

    this.easystar = new EasyStar.js();
    this.scene.events.on("mapArrayReady", () => {
      this.easystar.setGrid(data.currentMapArray);
    });

    this.easystar.setAcceptableTiles([0, 1, 2]);
    this.easystar.setIterationsPerCalculation(1000);
    // this.easystar.enableDiagonals();
    this.easystar.disableCornerCutting();

    // Initialize the timed event
    this.timedEvent = null;
  }

  handlePointerDown(pointer) {
    console.log(data.currentMapArray);
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
          console.log("The path to the destination point was not found.");
        } else {
          // Log the path
          console.log(path);
          // Save the path for later
          this.path = path;
          this.moveAlongPath(path);
        }
      }
    );

    // Don't forget to calculate the pathfinding!
    this.easystar.calculate();

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

    console.log(
      `world point in handle pointer down: ${worldPoint.x}, ${worldPoint.y}`
    );

    // Calculate the direction of the movement
    let direction = this.calculateDirection(
      this.targetPosition.x,
      this.targetPosition.y
    );

    // Update the facing direction based on the movement direction
    this.updateFacingDirection(direction);

    return tileXY;
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
    if (!path || path.length === 0) {
      console.log("Reached final destination");
      this.isClickToMove = false;
      return;
    }

    this.isClickToMove = true;

    // Create a timed event that fires every 500 milliseconds
    this.timedEvent = this.scene.time.addEvent({
      delay: 500, // ms
      callback: () => {
        // Get the next tile from the path
        const nextTile = path.shift();
        const worldPoint = this.scene.terrain.map.tileToWorldXY(
          nextTile.x,
          nextTile.y
        );

        worldPoint.x += this.tileWidth / 2;
        worldPoint.y += this.tileHeight / 2;

        console.log(
          `world point in move along path: ${worldPoint.x}, ${worldPoint.y}`
        );

        // Teleport the player to the next tile
        this.x = worldPoint.x;
        this.y = worldPoint.y;

        // If we've reached the end of the path, stop the timed event
        if (path.length === 0) {
          this.timedEvent.remove();
          console.log("Reached final destination");
          this.isClickToMove = false;
        }
      },
      // Scope of callback function
      callbackScope: this,
      // Repeat forever until we manually stop it
      loop: true,
    });
  }

  takeDamage(damage) {
    this.current_health -= damage;
    // Check if health is less than 0 and set it to 0
    if (this.current_health < 0) {
      this.current_health = 0;
      this.scene.gameOver();
    }
    this.healthBar.updateHealth(this.current_health);
  }

  update() {
    // Update player's tile coordinates
    this.playerTileX = Math.floor(this.x / this.tileWidth);
    this.playerTileY = Math.floor(this.y / this.tileHeight);
    // console.log(`Player tile: ${this.playerTileX}, ${this.playerTileY}`);
    if (!this.isClickToMove) {
      this.body.setVelocity(0);
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

    // Horizontal movement
    if (
      this.cursors.left.isDown ||
      this.keys.A.isDown ||
      this.cursors.right.isDown ||
      this.keys.D.isDown
    ) {
      this.targetPosition = null;
      this.highlight.clear(); // Clear the highlight
    }
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.body.setVelocityX(-100);
      this.facing = "left";
      this.isClickToMove = false;
      this.timedEvent.remove();
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.body.setVelocityX(100);
      this.facing = "right";
      this.isClickToMove = false;
      this.timedEvent.remove();
    }

    // Vertical movement
    if (
      this.cursors.up.isDown ||
      this.keys.W.isDown ||
      this.cursors.down.isDown ||
      this.keys.S.isDown
    ) {
      this.targetPosition = null;
      this.highlight.clear(); // Clear the highlight
    }
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.body.setVelocityY(-100);
      this.facing = "up";
      this.isClickToMove = false;
      this.timedEvent.remove();
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.body.setVelocityY(100);
      this.facing = "down";
      this.isClickToMove = false;
      this.timedEvent.remove();
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
  }
}

/**  Use joystick
if (this.cursorKeys) {
  if (this.cursorKeys.left.isDown) {
    this.body.setVelocityX(-100);
    this.facing = "left";
  } else if (this.cursorKeys.right.isDown) {
    this.body.setVelocityX(100);
    this.facing = "right";
  }

  if (this.cursorKeys.up.isDown) {
    this.body.setVelocityY(-100);
    this.facing = "up";
  } else if (this.cursorKeys.down.isDown) {
    this.body.setVelocityY(100);
    this.facing = "down";
  }
}
*/

/** Original click-to-move code
 * 
 

if (this.targetPosition) {
  const speed = 100; // adjust as needed
  this.scene.physics.moveTo(
    this,
    this.targetPosition.x,
    this.targetPosition.y,
    speed
  );

  // If close enough to target, stop moving
  if (
    Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetPosition.x,
      this.targetPosition.y
    ) < 5
  ) {
    this.body.setVelocity(0);
    this.targetPosition = null;
    this.highlight.clear(); // Clear the highlight
  }
}


 * 
 */
