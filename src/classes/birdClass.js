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
    // Emit an event to the scene to let it know that this entity was destroyed
    this.emit(Events.MonsterDestroyed, this);

    // Destroy the health bar
    this.healthBar.destroy();

    // Check if the scene is defined
    if (this.scene) {
      let explosion = this.scene.add.sprite(
        this.x,
        this.y,
        Animations.Explosion
      );

      // Play the explosion animation
      explosion.play("explosion");

      // Remove the explosion sprite when the animation is complete
      explosion.on("animationcomplete", () => {
        explosion.destroy();
      });

      // Calculate the closest tile's center coordinates
      let tileX = Math.round(this.x / 16);
      let tileY = Math.round(this.y / 16);

      // Check if the tile type at the calculated position is an obstruction
      while (
        this.obstructionTiles.includes(data.currentMapArray[tileY][tileX])
      ) {
        // If it is an obstruction, move to the next tile
        tileX += 1;
        if (tileX > 63) {
          tileX = 63; // Keep tileX within world bounds
          break; // Exit the loop if we've reached the world bounds
        }
        tileY += 1;
        if (tileY > 63) {
          tileY = 63; // Keep tileY within world bounds
          break; // Exit the loop if we've reached the world bounds
        }
      }

      // Adjust the coordinates to the center of the tile
      let jewelX = Math.min(tileX * 16 + 8, 1023 - 8);
      let jewelY = Math.min(tileY * 16 + 8, 1023 - 8);

      // use math.random and an 50% chance to drop a jewel

      if (Math.random() < 0.75) {
        // Instantiate a jewel at the closest non-obstruction tile's center
        new Jewel(this.scene, jewelX, jewelY, this.scene.jewels, [
          Colors.Pumpkin,
          Colors.Yellow,
        ]);
      }
    }

    // transition the frog to the destroyed state
    this.stateMachine.transition(States.Destroyed);

    // Call the parent class's destroy method
    super.destroy();
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
