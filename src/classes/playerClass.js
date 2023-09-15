import Entity from "./entityClass.js";
import HealthBar from "./healthBarClass.js";

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
    this.cursorKeys = this.scene.joystick.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,J,K,L,I");
    this.collectedJewels = 0;
    this.tint = 0x2986cc;
    this.facing = "down";

    this.highlight = this.scene.add.graphics({
      fillStyle: { color: 0xffffff },
    });
    this.highlight.alpha = 0.5; // make it semi-transparent

    this.scene.input.on(
      "pointerdown",
      pointer => this.handlePointerDown(pointer, this.scene.terrain.map),
      this
    );
  }

  handlePointerDown(pointer) {
    this.tileWidth = 16;
    this.tileHeight = 16;
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

    // Convert the tile coordinates back to world coordinates
    worldPoint = this.scene.terrain.map.tileToWorldXY(tileXY.x, tileXY.y);

    // Log the position where the pointer was pressed
    console.log(`Pointer down at tile ${tileXY.x}, ${tileXY.y}`);

    // Draw a rectangle at the top-left corner of the clicked tile
    this.highlight.fillRect(
      worldPoint.x,
      worldPoint.y,
      this.tileWidth,
      this.tileHeight
    );

    return tileXY;
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
    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    this.body.setVelocity(0);

    // Use joystick
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

    // Horizontal movement
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.body.setVelocityX(-100);
      this.facing = "left";
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.body.setVelocityX(100);
      this.facing = "right";
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.body.setVelocityY(-100);
      this.facing = "up";
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.body.setVelocityY(100);
      this.facing = "down";
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
