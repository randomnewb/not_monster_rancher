import { Assets, States } from "../utils/constants.js";
import State from "./state.js";

export default class ChaseState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    npc.setVelocity(0);
    npc.isMoving = true;
  }

  execute(scene, npc) {
    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    if (distance > npc.disengagementRange) {
      npc.stateMachine.transition(States.Idle);

      let questionSprite = scene.add.sprite(
        npc.x,
        npc.y - npc.height,
        Assets.Reactions,
        2
      );

      scene.tweens.add({
        targets: questionSprite,
        alpha: 0,
        duration: 1000,
        onComplete: function () {
          questionSprite.destroy();
        },
      });
    } else if (distance <= npc.attackTransitionRange) {
      npc.stateMachine.transition(States.Attack);
    } else {
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

  exit(scene, npc) {}
}
