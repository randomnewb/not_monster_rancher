import Entity from "./entityClass.js";
import StateMachine from "./stateMachineClass.js";
import IdleState from "../states/idle.js";

export default class NPC extends Entity {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    // Initialize state machine
    this.stateMachine = new StateMachine(
      "idle",
      {
        idle: new IdleState(),
        // wander: new WanderState(),
        // detect: new DetectState(),
        // chase: new ChaseState(),
        // attack: new AttackState(),
      },
      [scene, this]
    );
  }

  update() {
    this.stateMachine.step();
  }
}
