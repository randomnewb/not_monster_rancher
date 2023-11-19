import { Assets, Events, spawnerTileColors } from "../utils/constants.js";
import Bird from "./birdClass.js";
import Bat from "./batClass.js";
import Frog from "./frogClass.js";

export default class EntitySpawner extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, monsterClass) {
    super(scene, x, y, Assets.Spawner);

    this.scene = scene;
    this.monsterClass = monsterClass;

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.setImmovable(true);

    this.spawnCounterMax = 1000;
    this.spawnCounter = this.spawnCounterMax;

    this.setTint(
      spawnerTileColors[Math.floor(Math.random() * spawnerTileColors.length)]
    );
  }

  update() {
    this.spawnCounter--;

    if (this.spawnCounter <= 0) {
      this.spawnMonster();
      this.spawnCounter = this.spawnCounterMax;
    }
  }

  spawnMonster() {
    if (this.scene.monsters.length < 100) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 50;

      const spawnX = this.x + Math.cos(angle) * distance;
      const spawnY = this.y + Math.sin(angle) * distance;

      const monster = new this.monsterClass(
        this.scene,
        spawnX,
        spawnY,
        "monster"
      );

      monster.setDepth(1);
      monster.on(
        Events.MonsterDestroyed,
        this.scene.handleMonsterDefeated,
        this.scene
      );

      this.scene.monsters.push(monster);

      this.scene.physics.world.enable(monster);

      this.scene.physics.add.overlap(
        monster,
        this.scene.playerProjectiles,
        this.scene.hitMonster,
        null,
        this.scene
      );

      monster.on(
        Events.FireProjectile,
        (monster, direction, min_attack, max_attack) => {
          this.scene.enemyProjectiles.fireProjectile(
            monster.x,
            monster.y,
            direction,
            min_attack,
            max_attack
          );
        }
      );

      this.scene.physics.add.overlap(
        this.scene.enemyProjectiles,
        this.scene.player,
        this.scene.playerHit,
        null,
        this.scene
      );

      this.scene.physics.add.overlap(
        this.scene.projectileGroup,
        this.scene.monsters,
        this.scene.hitMonster,
        null,
        this.scene
      );

      if (!(monster instanceof Bird || monster instanceof Bat)) {
        this.scene.physics.add.collider(monster, this.scene.terrain.layer);
      }
    }
  }
}
