import {
  Assets,
  States,
  Colors,
  Events,
  Animations,
} from "../utils/constants.js";

import NPC from "./npcClass.js";
import Jewel from "./jewelClass.js";
import data from "../data/data.js";

export default class Bat extends NPC {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.entityName = "Bat";

    this.level = 3;

    this.max_health = Phaser.Math.Between(1, 3);
    this.min_attack = 3;
    this.max_attack = 5;
    this.speed = Phaser.Math.Between(40, 75);
    this.directions = [90, 270];
    this.wanderTime = Phaser.Math.Between(10, 20) * 60;
    this.idleTime = Phaser.Math.Between(1, 2) * 60;
    this.attackTransitionRange = 36;
    this.detectionRange = 70;
    this.disengagementRange = 90;

    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.scene.physics.world.enable(this);
    this.body.setCircle(5, 5, 5);

    this.isMoving = false;

    const entityColors = [
      Colors.LightGrey,
      Colors.Navy,
      Colors.RoyalBlue,
      Colors.DarkBrown,
      Colors.LightBrown,
    ];

    this.originalTint =
      entityColors[Math.floor(Math.random() * entityColors.length)];

    this.setTint(this.originalTint);
  }

  getJewelColors() {
    return [Colors.DarkGrey, Colors.Black, Colors.DarkBrown];
  }

  update() {
    super.update();

    if (!this.active) {
      return;
    }

    this.healthBar.setPosition(this.x, this.y + 10);

    if (this.isMoving) {
      this.anims.play(Animations.BatMove, true);

      if (this.body.velocity.x > 0) {
        this.flipX = true;
      } else if (this.body.velocity.x < 0) {
        this.flipX = false;
      }
    } else {
      this.anims.play(Animations.BatIdle, true);
    }
  }
}
