import State from "./state.js";

export default class IdleState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the idle state`);
    npc.setVelocity(0);
    npc.isMoving = false;
    npc.idleTime = Phaser.Math.Between(1, 5) * 60; // Idle for 1 to 5 seconds (60 frames per second)
    npc.idleCounter = 0; // Initialize counter
  }

  execute(scene, npc) {
    // Increment the counter each frame
    npc.idleCounter++;

    // Calculate the distance between the npc and the player
    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    // Check if the player is within 3 tiles distance
    if (distance <= 64) {
      npc.stateMachine.transition("detect");
      npc.idleCounter = 0; // Reset counter
    }
    // Check if the counter has exceeded the idle time
    else if (npc.idleCounter > npc.idleTime) {
      npc.stateMachine.transition("wander");
      npc.idleCounter = 0; // Reset counter
    }
  }

  exit(scene, npc) {
    if (npc.idleCounter) {
      // If there's an idle event scheduled
      npc.idleCounter = 0; // Reset counter
    }
  }
}
