import State from "./state.js";

export default class IdleState extends State {
  enter(scene, npc) {
    // Idle state enter logic

    console.log(`${npc.constructor.name} entered the idle state`);

    // For example, you might want to set the NPC's velocity to 0
    npc.setVelocity(0);
  }

  execute(scene, npc) {
    // Idle state logic
    // For example, you might want to have the NPC stand still for a random amount of time
    // You can use Phaser's time events to schedule a transition to the 'wander' state after a random amount of time
    let idleTime = Phaser.Math.Between(1, 5) * 1000; // Idle for 1 to 5 seconds
    scene.time.delayedCall(idleTime, () => {
      npc.stateMachine.transition("wander");
    });
  }

  exit(scene, npc) {
    // Idle state exit logic
    // For example, you might want to reset some properties of the NPC
  }
}
