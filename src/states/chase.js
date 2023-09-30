import { Assets, States } from "../utils/constants.js";
import State from "./state.js";

export default class ChaseState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the chase state`);
    npc.setVelocity(0);
    npc.isMoving = true;

    // npc.chaseTime = Phaser.Math.Between(3, 5) * 60; // Idle for 1 to 5 seconds (60 frames per second)
    // npc.chaseCounter = 0; // Initialize counter
  }

  execute(scene, npc) {
    // Calculate the distance between the npc and the player
    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    // Check if the player is more than 60 units away
    if (distance > 96) {
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
    }
    // Check if the npc is within 2 tiles of the player
    else if (distance <= 32) {
      npc.stateMachine.transition(States.Attack);
    } else {
      // Calculate the angle to the player
      const angle = Phaser.Math.Angle.Between(
        npc.x,
        npc.y,
        scene.player.x,
        scene.player.y
      );

      // Set the velocity of the npc to move towards the player
      npc.setVelocity(
        Math.cos(angle) * npc.speed * 1.2,
        Math.sin(angle) * npc.speed * 1.2
      );
    }
  }

  exit(scene, npc) {
    // if (npc.chaseCounter) {
    // If there's a chase event scheduled
    //   npc.chaseCounter = 0; // Reset counter
    // }
  }
}
