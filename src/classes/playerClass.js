import Entity from "./entityClass.js";
import HealthBar from "./healthBarClass.js";

export default class Player extends Entity {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.max_health = 100;
    this.current_health = 100;
    this.healthBar = new HealthBar(
      scene,
      x,
      y,
      this.max_health,
      this.current_health
    );

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds();

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursorKeys = this.scene.joystick.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,J,K,L,I");
    this.collectedJewels = 0;
    this.tint = 0x2986cc;
    this.facing = "down";
  }

  takeDamage(damage) {
    this.current_health -= damage;

    if (this.current_health < 0) {
      this.current_health = 0;
    }

    this.healthBar.decrease(this.current_health);
  }

  update() {
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

    this.healthBar.setPosition(this.x - 20, this.y + this.height);
  }
}