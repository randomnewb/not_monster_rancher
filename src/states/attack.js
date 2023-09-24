import State from "./state.js";

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
  }

  execute(scene, npc) {
    // Increment the counter each frame
    npc.attackCounter++;

    // Check if the counter has exceeded the attack time
    if (npc.attackCounter > npc.attackTime) {
      npc.stateMachine.transition("attack");
      npc.attackCounter = 0; // Reset counter
    }
  }

  exit(scene, npc) {
    if (npc.attackCounter) {
      // If there's an attack event scheduled
      npc.attackCounter = 0; // Reset counter
    }
  }
}
