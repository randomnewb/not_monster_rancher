import {
  Assets,
  States,
  Colors,
  Events,
  Animations,
} from "../utils/constants.js";

import NPC from "./npcClass.js";

export default class Bird extends NPC {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.max_health = Phaser.Math.Between(2, 4);
    this.speed = Phaser.Math.Between(25, 50);
    this.wanderTime = Phaser.Math.Between(5, 10) * 60;
    this.attackTransitionRange = 48;
    this.detectionRange = 80;
    this.disengagementRange = 100;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setCircle(5, 5, 5);

    this.isMoving = false;

    const birdColors = [
      Colors.LightGrey,
      Colors.SkyBlue,
      Colors.Beige,
      Colors.Tan,
      Colors.LightBrown,
    ];

    this.originalTint =
      birdColors[Math.floor(Math.random() * birdColors.length)];

    this.setTint(this.originalTint);
  }

  update() {
    // Call the parent class's update method
    super.update();

    if (!this.active) {
      return;
    }

    this.healthBar.setPosition(this.x, this.y + 10);

    if (this.isMoving) {
      this.anims.play(Animations.BirdMove, true);

      if (this.body.velocity.x > 0) {
        this.flipX = true;
      } else if (this.body.velocity.x < 0) {
        this.flipX = false;
      }
    } else {
      this.anims.play(Animations.BirdIdle, true);
    }
  }
}
