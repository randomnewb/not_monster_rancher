import State from "./state.js";

export default class IdleState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the idle state`);
    npc.setVelocity(0);
    npc.isMoving = false;
    let idleTime = Phaser.Math.Between(1, 5) * 1000;
    npc.stateEvent = scene.time.delayedCall(idleTime, () => {
      npc.stateMachine.transition("wander");
    });
  }

  execute(scene, npc) {}

  exit(scene, npc) {
    if (npc.stateEvent) {
      npc.stateEvent.remove();
      npc.stateEvent = null;
    }
  }
}
