import State from "./state.js";

export default class WanderState extends State {
  constructor() {
    super();
    this.wanderEvent = null; // Add this line
  }

  destroy(scene, npc) {
    // Remove the wander event if it exists
    if (this.wanderEvent) {
      this.wanderEvent.remove();
      this.wanderEvent = null;
    }
  }

  enter(scene, npc) {
    // console.log(`${npc.constructor.name} entered the wander state`);
    npc.isMoving = true;

    // Wander state logic
    let directions = [0, 90, 180, 270]; // Orthogonal directions in degrees
    let direction = Phaser.Math.RND.pick(directions) * (Math.PI / 180); // Pick a random direction and convert to radians
    let speed = 15; // Adjust speed to your needs
    npc.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);

    // Schedule a transition back to the 'idle' state after a random amount of time
    let wanderTime = Phaser.Math.Between(1, 5) * 1000; // Wander for 1 to 5 seconds
    this.wanderEvent = scene.time.delayedCall(wanderTime, () => {
      if (npc.active) {
        // Check if the NPC still exists
        npc.setVelocity(0); // Stop moving
        npc.stateMachine.transition("idle");
      }
    });
  }

  execute(scene, npc) {
    // Wander state logic can be left empty if you don't need to do anything every frame
  }

  exit(scene, npc) {
    npc.isMoving = false;
    // Wander state exit logic
    if (this.wanderEvent) {
      // If there's a wander event scheduled
      this.wanderEvent.remove(); // Remove it to prevent it from firing after we've exited the state
      this.wanderEvent = null;
    }
  }
}
