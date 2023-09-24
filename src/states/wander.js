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
    let wanderTime = Phaser.Math.Between(1, 5) * 1000; // Wander for 1 to 5 seconds
    npc.stateEvent = scene.time.delayedCall(wanderTime, () => {
      npc.stateMachine.transition("idle");
    });
    // console.log(scene.time.delayedCall().delay);
  }

  execute(scene, npc) {
    // Wander state logic can be left empty if you don't need to do anything every frame
  }

  exit(scene, npc) {
    npc.isMoving = false;
    // Wander state exit logic
    if (npc.stateEvent) {
      // If there's a wander event scheduled
      npc.stateEvent.remove(); // Remove it to prevent it from firing after we've exited the state
      npc.stateEvent = null;
    }
  }
}
