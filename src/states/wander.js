import { Assets, States } from "../utils/constants.js";
import State from "./state.js";

export default class WanderState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    npc.isMoving = true;

    let direction = Phaser.Math.RND.pick(npc.directions) * (Math.PI / 180); // Pick a random direction and convert to radians
    let speed = npc.speed;
    npc.setVelocity(Math.cos(direction) * speed, Math.sin(direction) * speed);

    npc.wanderTime = Phaser.Math.Between(1, 5) * 60;
    npc.wanderCounter = 0;
  }

  execute(scene, npc) {
    npc.wanderCounter++;

    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    if (distance <= npc.detectionRange) {
      npc.stateMachine.transition(States.Detect);
      npc.wanderCounter = 0;
    } else if (npc.wanderCounter > npc.wanderTime) {
      npc.stateMachine.transition(States.Idle);
      npc.wanderCounter = 0;
    }
  }

  exit(scene, npc) {
    npc.isMoving = false;
    if (npc.wanderCounter) {
      npc.wanderCounter = 0;
    }
  }
}
