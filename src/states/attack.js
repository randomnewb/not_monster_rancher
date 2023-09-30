import { Assets, States, Colors } from "../utils/constants.js";
import State from "./state.js";

export default class AttackState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    npc.setVelocity(0);
    npc.isMoving = false;

    // Initialize cooldown counter and max value
    npc.cooldownCounterMax = Phaser.Math.Between(450, 700);
    npc.cooldownCounter = 0;

    // Initialize flash counter and tint
    npc.flashCounter = 200;
    npc.flashTint = Colors.Yellow;
  }

  execute(scene, npc) {
    // Calculate the distance between the npc and the player
    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    // Check if the player is more than 80 units away
    if (distance > 80) {
      npc.stateMachine.transition(States.Idle);

      // Create the question mark sprite above the npc's head
      let questionSprite = scene.add.sprite(
        npc.x,
        npc.y - npc.height,
        Assets.Reactions,
        2
      );

      // Make the sprite fade away after 1 second
      scene.tweens.add({
        targets: questionSprite,
        alpha: 0,
        duration: 1000,
        onComplete: function () {
          questionSprite.destroy();
        },
      });
      return;
    }

    // Handle flashing
    if (npc.flashCounter > 0) {
      npc.flashCounter--;

      if (npc.flashCounter <= 0) {
        npc.tint = npc.originalTint;
      } else if (npc.flashCounter <= 50) {
        npc.tint = npc.originalTint;
      } else if (npc.flashCounter <= 100) {
        npc.tint = npc.flashTint;
      } else if (npc.flashCounter <= 150) {
        npc.tint = npc.originalTint;
      } else {
        npc.tint = npc.flashTint;
      }
    }

    // Only start cooldown counter when flashCounter is 0
    if (npc.flashCounter === 0) {
      npc.cooldownCounter--;

      // Fire a projectile when cooldownCounter reaches 0
      if (npc.cooldownCounter <= 0) {
        // Calculate the direction from the NPC to the player
        let direction = Phaser.Math.Angle.BetweenPoints(npc, scene.player);

        // Convert the angle to a vector
        let directionVector = {
          x: Math.cos(direction),
          y: Math.sin(direction),
        };

        // Emit an event instead of firing the projectile directly
        npc.emit(
          "fireProjectile",
          npc,
          directionVector,
          npc.min_attack,
          npc.max_attack
        );

        // Reset cooldownCounter
        npc.cooldownCounter = npc.cooldownCounterMax;
      }
    }
  }

  exit(scene, npc) {
    if (npc.cooldownCounter !== npc.cooldownCounterMax) {
      // If there's an attack event scheduled
      npc.cooldownCounter = npc.cooldownCounterMax; // Reset counter
    }
  }
}
