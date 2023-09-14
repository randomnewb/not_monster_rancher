import Entity from "./entityClass.js";
import HealthBar from "./healthBarClass.js";

export default class Frog extends Entity {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.max_health = 100;
    this.current_health = 100;
    this.healthBar = new HealthBar(scene, x, y, this.max_health);

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.setCollideWorldBounds();
    this.isMoving = false;

    const frogColors = [
      0x2986cc, 0x0cc986, 0x0ab478, 0x09a06b, 0x088c5d, 0x077850,
    ];

    this.tint = frogColors[Math.floor(Math.random() * frogColors.length)];

    this.updateCounter = 0;
    this.toggleFrames = Phaser.Math.Between(60, 180);
  }

  toggleMovement() {
    this.isMoving = !this.isMoving;

    if (this.isMoving) {
      let velocityIncrease = Phaser.Math.Between(20, 50);

      // Randomly choose to increase or decrease velocityX or velocityY
      if (Phaser.Math.Between(0, 1) === 0) {
        // Randomly choose to increase or decrease velocityX
        this.body.velocity.x +=
          Phaser.Math.Between(0, 1) === 0
            ? velocityIncrease
            : -velocityIncrease;
      } else {
        // Randomly choose to increase or decrease velocityY
        this.body.velocity.y +=
          Phaser.Math.Between(0, 1) === 0
            ? velocityIncrease
            : -velocityIncrease;
      }
    } else {
      // Set velocity to 0 to make the entity idle
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    }
  }

  takeDamage(damage) {
    this.current_health -= damage;
    // Check if health is less than 0 and set it to 0
    if (this.current_health < 0) {
      this.current_health = 0;
      this.destroy();
    }
    this.healthBar.updateHealth(this.current_health);
  }

  update() {
    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    this.healthBar.setPosition(this.x, this.y + 10);

    // increment the counter each update call
    this.updateCounter++;

    if (this.updateCounter >= this.toggleFrames) {
      // if counter reached the toggle time, toggle the movement
      this.toggleMovement();

      // reset the counter
      this.updateCounter = 0;

      // set the next toggle time
      this.toggleFrames = Phaser.Math.Between(60, 180);
    }

    if (this.isMoving) {
      this.anims.play("frog_move", true);

      // Flip the animation based on the direction of movement
      if (this.body.velocity.x > 0) {
        // Moving to the right
        this.flipX = true;
      } else if (this.body.velocity.x < 0) {
        // Moving to the left
        this.flipX = false;
      }
    } else {
      this.anims.play("frog_idle", true);
    }
  }
}
