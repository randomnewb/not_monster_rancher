import HealthBar from "./healthBarClass.js";
import Jewel from "./jewelClass.js";
import data from "../data/data.js";
import { States, Colors, Events, Animations } from "../utils/constants.js";
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
    this.obstructionTiles = [8, 9, 10, 11, 12, 13];

    this.attackTransitionRange = 32;
    this.detectionRange = 64;
    this.disengagementRange = 80;
  }

  takeDamage(damage) {
    this.current_health -= damage;
    // Check if health is less than 0 and set it to 0
    if (this.current_health <= 0) {
      this.current_health = 0;
      this.destroy();
    }
    this.healthBar.setVisible(true);
    this.healthBar.updateHealth(this.current_health);

    this.setTint(Colors.White);
    this.invincibilityTimer = 30;
  }

  destroy() {
    // Emit an event to the scene to let it know that this entity was destroyed
    this.emit(Events.MonsterDestroyed, this);

    // Destroy the health bar
    this.healthBar.destroy();

    // Check if the scene is defined
    if (this.scene) {
      let explosion = this.scene.add.sprite(
        this.x,
        this.y,
        Animations.Explosion
      );

      // Play the explosion animation
      explosion.play("explosion");

      // Remove the explosion sprite when the animation is complete
      explosion.on("animationcomplete", () => {
        explosion.destroy();
      });

      // Calculate the closest tile's center coordinates
      let tileX = Math.round(this.x / 16);
      let tileY = Math.round(this.y / 16);

      // Check if the tile type at the calculated position is an obstruction
      while (
        this.obstructionTiles.includes(data.currentMapArray[tileY][tileX])
      ) {
        // If it is an obstruction, move to the next tile
        tileX += 1;
        if (tileX > 63) {
          tileX = 63; // Keep tileX within world bounds
          break; // Exit the loop if we've reached the world bounds
        }
        tileY += 1;
        if (tileY > 63) {
          tileY = 63; // Keep tileY within world bounds
          break; // Exit the loop if we've reached the world bounds
        }
      }

      // Adjust the coordinates to the center of the tile
      let jewelX = Math.min(tileX * 16 + 8, 1023 - 8);
      let jewelY = Math.min(tileY * 16 + 8, 1023 - 8);

      // use math.random and an 50% chance to drop a jewel

      if (Math.random() < 0.5) {
        // Instantiate a jewel at the closest non-obstruction tile's center
        new Jewel(this.scene, jewelX, jewelY, this.scene.jewels, [
          Colors.CardinalRed,
          Colors.Yellow,
          Colors.LightBlue,
        ]);
      }
    }

    // transition the frog to the destroyed state
    this.stateMachine.transition(States.Destroyed);

    // Call the parent class's destroy method
    super.destroy();
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
