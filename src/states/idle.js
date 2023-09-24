import State from "./state.js";

export default class IdleState extends State {
  constructor() {
    super();
    this.idleEvent = null;
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the idle state`);
    npc.setVelocity(0);
    let idleTime = Phaser.Math.Between(1, 5) * 1000;
    this.idleEvent = scene.time.delayedCall(idleTime, () => {
      npc.stateMachine.transition("wander");
    });
  }

  execute(scene, npc) {}

  exit(scene, npc) {
    if (this.idleEvent) {
      this.idleEvent.remove();
      this.idleEvent = null;
    }
  }
}
