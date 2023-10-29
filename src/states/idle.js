import { Assets, States } from "../utils/constants.js";
import State from "./state.js";

export default class IdleState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    npc.setVelocity(0);
    npc.isMoving = false;
    npc.idleTime = Phaser.Math.Between(1, 5) * 60;
    npc.idleCounter = 0;
  }

  execute(scene, npc) {
    npc.idleCounter++;

    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    if (distance <= npc.detectionRange) {
      npc.stateMachine.transition(States.Detect);
      npc.idleCounter = 0;
    } else if (npc.idleCounter > npc.idleTime) {
      npc.stateMachine.transition(States.Wander);
      npc.idleCounter = 0;
    }
  }

  exit(scene, npc) {
    if (npc.idleCounter) {
      npc.idleCounter = 0;
    }
  }
}
