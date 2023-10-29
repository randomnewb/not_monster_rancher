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

export default class Bird extends NPC {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.entityName = "Bird";

    this.level = 2;

    this.max_health = Phaser.Math.Between(2, 4);
    this.speed = Phaser.Math.Between(25, 50);
    this.directions = [0, 180];
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

    const entityColors = [
      Colors.LightGrey,
      Colors.SkyBlue,
      Colors.Beige,
      Colors.Tan,
      Colors.LightBrown,
    ];

    this.originalTint =
      entityColors[Math.floor(Math.random() * entityColors.length)];

    this.setTint(this.originalTint);
  }

  destroy() {
    this.emit(Events.MonsterDestroyed, this);

    this.healthBar.destroy();

    if (this.scene) {
      let explosion = this.scene.add.sprite(
        this.x,
        this.y,
        Animations.Explosion
      );

      explosion.play("explosion");

      explosion.on("animationcomplete", () => {
        explosion.destroy();
      });

      let tileX = Math.round(this.x / 16);
      let tileY = Math.round(this.y / 16);

      while (
        this.obstructionTiles.includes(data.currentMapArray[tileY][tileX])
      ) {
        tileX += 1;
        if (tileX > 63) {
          tileX = 63;
          break;
        }
        tileY += 1;
        if (tileY > 63) {
          tileY = 63;
          break;
        }
      }

      let jewelX = Math.min(tileX * 16 + 8, 1023 - 8);
      let jewelY = Math.min(tileY * 16 + 8, 1023 - 8);

      if (Math.random() < 0.75) {
        new Jewel(this.scene, jewelX, jewelY, this.scene.jewels, [
          Colors.Pumpkin,
          Colors.Yellow,
        ]);
      }
    }

    this.stateMachine.transition(States.Destroyed);

    super.destroy();
  }

  update() {
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
