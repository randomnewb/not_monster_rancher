import State from "./state.js";
import { EnemyProjectileGroup } from "../scripts/enemyProjectileGroup.js";

export default class AttackState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the attack state`);
    npc.setVelocity(0);
    npc.isMoving = false;

    npc.attackTime = Phaser.Math.Between(3, 5) * 60; // Idle for 1 to 5 seconds (60 frames per second)
    npc.attackCounter = 0; // Initialize counter

    // Initialize flash counter and tint
    npc.flashCounter = 300;
    npc.flashTint = 0xffff00; // Yellow

    // Create a new projectile group for this NPC
    // npc.projectiles = new EnemyProjectileGroup(scene);
  }

  execute(scene, npc) {
    // Increment the counter each frame
    npc.attackCounter++;

    // Fire a projectile every 60 frames (1 second)
    if (npc.attackCounter % 60 === 0) {
      // Calculate the direction from the NPC to the player
      let direction = Phaser.Math.Angle.BetweenPoints(npc, scene.player);

      // Convert the angle to a vector
      let directionVector = { x: Math.cos(direction), y: Math.sin(direction) };

      // Fire a projectile in the direction of the player
      // npc.projectiles.fireProjectile(npc.x, npc.y, directionVector);

      // Emit an event instead of firing the projectile directly
      npc.emit("fireProjectile", npc, directionVector);
    }

    // Handle flashing
    if (npc.flashCounter > 0) {
      npc.flashCounter--;

      if (npc.flashCounter <= 0) {
        npc.tint = npc.originalTint;
      } else if (npc.flashCounter <= 75) {
        npc.tint = npc.originalTint;
      } else if (npc.flashCounter <= 150) {
        npc.tint = npc.flashTint;
      } else if (npc.flashCounter <= 225) {
        npc.tint = npc.originalTint;
      } else {
        npc.tint = npc.flashTint;
      }
    }
  }

  exit(scene, npc) {
    if (npc.attackCounter) {
      // If there's an attack event scheduled
      npc.attackCounter = 0; // Reset counter
    }
  }
}
