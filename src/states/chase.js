import State from "./state.js";

export default class ChaseState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    console.log(`${npc.constructor.name} entered the chase state`);
    npc.setVelocity(0);
    npc.isMoving = false;

    npc.chaseTime = Phaser.Math.Between(3, 5) * 60; // Idle for 1 to 5 seconds (60 frames per second)
    npc.chaseCounter = 0; // Initialize counter
  }

  execute(scene, npc) {
    // Increment the counter each frame
    npc.chaseCounter++;

    // Check if the counter has exceeded the chase time
    if (npc.chaseCounter > npc.chaseTime) {
      npc.stateMachine.transition("attack");
      npc.chaseCounter = 0; // Reset counter
    }
  }

  exit(scene, npc) {
    if (npc.chaseCounter) {
      // If there's a chase event scheduled
      npc.chaseCounter = 0; // Reset counter
    }
  }
}
