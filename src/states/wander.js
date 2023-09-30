import { Assets, States } from "../utils/constants.js";
import State from "./state.js";

export default class WanderState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the wander state`);
    npc.isMoving = true;

    // Wander state logic
    let directions = [0, 90, 180, 270]; // Orthogonal directions in degrees
    let direction = Phaser.Math.RND.pick(directions) * (Math.PI / 180); // Pick a random direction and convert to radians
    let speed = npc.speed; // Adjust speed to your needs
    npc.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);

    // Schedule a transition back to the 'idle' state after a random amount of time
    npc.wanderTime = Phaser.Math.Between(1, 5) * 60; // Wander for 1 to 5 seconds (60 frames per second)
    npc.wanderCounter = 0; // Initialize counter
  }

  execute(scene, npc) {
    // Increment the counter each frame
    npc.wanderCounter++;

    // Calculate the distance between the npc and the player
    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    // Check if the player is within 3 tiles distance
    if (distance <= 48) {
      npc.stateMachine.transition(States.Detect);
      npc.wanderCounter = 0; // Reset counter
    }
    // Check if the counter has exceeded the wander time
    else if (npc.wanderCounter > npc.wanderTime) {
      npc.stateMachine.transition(States.Idle);
      npc.wanderCounter = 0; // Reset counter
    }
  }

  exit(scene, npc) {
    npc.isMoving = false;
    // Wander state exit logic
    if (npc.wanderCounter) {
      // If there's a wander event scheduled
      npc.wanderCounter = 0; // Reset counter
    }
  }
}
