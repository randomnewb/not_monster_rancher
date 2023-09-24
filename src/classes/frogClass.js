import NPC from "./npcClass.js";
import HealthBar from "./healthBarClass.js";
import StateMachine from "./stateMachineClass.js";
import IdleState from "../states/idle.js";
import WanderState from "../states/wander.js";
import DetectState from "../states/detect.js";
import ChaseState from "../states/chase.js";
import AttackState from "../states/attack.js";
import DestroyedState from "../states/destroyed.js";

export default class Frog extends NPC {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.max_health = Phaser.Math.Between(3, 5);
    this.speed = Phaser.Math.Between(10, 30);

    this.current_health = this.max_health;
    this.healthBar = new HealthBar(scene, x, y, this.max_health);

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setCircle(5, 5, 5);
    this.setCollideWorldBounds();
    this.isMoving = false;
    this.invincibilityTimer = 0;

    const frogColors = [
      0x2986cc, 0x0cc986, 0x0ab478, 0x09a06b, 0x088c5d, 0x077850,
    ];

    this.originalTint =
      frogColors[Math.floor(Math.random() * frogColors.length)];

    this.setTint(this.originalTint);

    // this.stateEvent = null;

    // Initialize state machine
    this.stateMachine = new StateMachine(
      "idle",
      {
        idle: new IdleState(),
        wander: new WanderState(),
        destroyed: new DestroyedState(),
        detect: new DetectState(),
        chase: new ChaseState(),
        attack: new AttackState(),
      },
      [scene, this]
    );
  }

  takeDamage(damage) {
    this.current_health -= damage;
    // Check if health is less than 0 and set it to 0
    if (this.current_health <= 0) {
      this.current_health = 0;
      this.destroy();
    }
    this.healthBar.updateHealth(this.current_health);

    this.setTint(0xffffff);
    this.invincibilityTimer = 100;
  }

  destroy() {
    // Emit an event to the scene to let it know that this entity was destroyed
    this.emit("frogDestroyed");

    // Destroy the health bar
    this.healthBar.destroy();

    // transition the frog to the destroyed state
    this.stateMachine.transition("destroyed");

    // Call the parent class's destroy method
    super.destroy();
  }

  update() {
    // Call the parent class's update method
    super.update();

    // Call step on the new stateMachine
    this.stateMachine.step();

    if (!this.active) {
      return;
    }

    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    this.healthBar.setPosition(this.x, this.y + 10);

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

    // implemented inside update() method
    if (this.invincibilityTimer > 0) {
      let elapsed = this.scene.sys.game.loop.delta;
      this.invincibilityTimer -= elapsed;

      if (this.invincibilityTimer <= 0) {
        this.setTint(this.originalTint);
        this.invincibilityTimer = 0;
      }
    }
  }
}

/** old movement code 

in create() method
// for frog movement
// this.toggleFrames = Phaser.Math.Between(60, 180);

this.updateCounter = 0;

// separate function to toggle movement
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

    */
