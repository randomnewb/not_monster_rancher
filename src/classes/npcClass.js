import HealthBar from "./healthBarClass.js";
import Jewel from "./jewelClass.js";
import data from "../data/data.js";
import {
  States,
  Colors,
  Events,
  Animations,
  obstructionTiles,
} from "../utils/constants.js";
import Entity from "./entityClass.js";
import StateMachine from "./stateMachineClass.js";
import IdleState from "../states/idle.js";
import WanderState from "../states/wander.js";
import DetectState from "../states/detect.js";
import ChaseState from "../states/chase.js";
import AttackState from "../states/attack.js";
import DestroyedState from "../states/destroyed.js";

export default class NPC extends Entity {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.stateMachine = new StateMachine(
      States.Idle,
      {
        idle: new IdleState(),
        wander: new WanderState(),
        destroyed: new DestroyedState(),
        detect: new DetectState(),
        chase: new ChaseState(),
        attack: new AttackState(),
      },
      [scene, this]
    );

    this.max_health = Phaser.Math.Between(5, 10);
    this.min_attack = 1;
    this.max_attack = 2;
    this.speed = Phaser.Math.Between(10, 30);
    this.invincibilityTimer = 0;

    this.current_health = this.max_health;
    this.healthBar = new HealthBar(scene, x, y, this.max_health);
    this.healthBar.setVisible(false);
    this.setCollideWorldBounds();

    this.attackTransitionRange = 32;
    this.detectionRange = 64;
    this.disengagementRange = 80;

    this.obstructionTiles = obstructionTiles;
  }

  takeDamage(damage) {
    this.current_health -= damage;

    if (this.current_health <= 0) {
      this.current_health = 0;
      this.destroy();
    }
    this.healthBar.setVisible(true);
    this.healthBar.updateHealth(this.current_health);

    this.setTint(Colors.White);
    this.invincibilityTimer = 30;
  }

  update() {
    this.stateMachine.step();

    if (this.current_health > this.max_health) {
      this.current_health = this.max_health;
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer--;

      if (this.invincibilityTimer <= 0) {
        this.setTint(this.originalTint);
        this.invincibilityTimer = 0;
      }
    }
  }
}
