import { Assets, States, Colors } from "../utils/constants.js";
import State from "./state.js";

export default class DetectState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    npc.setVelocity(0);
    npc.isMoving = false;

    npc.detectTime = Phaser.Math.Between(3, 5) * 60;
    npc.detectCounter = 0;

    let exclamationSprite = scene.add.sprite(
      npc.x,
      npc.y - npc.height,
      Assets.Reactions,
      0
    );

    exclamationSprite.setTint(Colors.Pink);

    scene.tweens.add({
      targets: exclamationSprite,
      alpha: 0,
      duration: 1000,
      onComplete: function () {
        exclamationSprite.destroy();
      },
    });
  }

  execute(scene, npc) {
    npc.detectCounter++;

    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    if (distance > npc.disengagementRange) {
      npc.stateMachine.transition(States.Idle);
      npc.detectCounter = 0;

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
    } else if (npc.detectCounter > npc.detectTime) {
      npc.stateMachine.transition(States.Chase);
      npc.detectCounter = 0;
    }
  }

  exit(scene, npc) {
    npc.isMoving = false;
    if (npc.detectCounter) {
      npc.detectCounter = 0;
    }
  }
}
