import {
  Scenes,
  Assets,
  Colors,
  Events,
  Animations,
  AnimationKeys,
} from "../utils/constants.js";

import preloadAssets from "../utils/preloadAssets.js";

import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";
import Terrain from "./terrainScene.js";
import Player from "../classes/playerClass.js";
import Frog from "../classes/frogClass.js";
import Bird from "../classes/birdClass.js";
import Bat from "../classes/batClass.js";
import DamageValue from "../classes/damageValueClass.js";
import { ProjectileGroup } from "../scripts/projectileGroup.js";
import { EnemyProjectileGroup } from "../scripts/enemyProjectileGroup.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.Game, active: false });
    this.tileWidth = 16;
    this.tileHeight = 16;
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
  }

  preload() {
    preloadAssets.call(this, this.load, this.tileWidth, this.tileHeight);
  }

  create() {
    this.createAnimationKeys();

    this.monsters = [];
    for (let i = 0; i < 100; i++) {
      let x = Phaser.Math.Between(0, 1024);
      let y = Phaser.Math.Between(0, 1024);

      let monsterType = Phaser.Math.Between(0, 2);
      if (monsterType === 0) {
        let frog = new Frog(this, x, y, Assets.Frog);
        frog.setDepth(1);
        frog.on(Events.MonsterDestroyed, this.handleMonsterDefeated, this);
        this.monsters.push(frog);
      } else if (monsterType === 1) {
        let bird = new Bird(this, x, y, Assets.Bird);
        bird.setDepth(1);
        bird.on(Events.MonsterDestroyed, this.handleMonsterDefeated, this);
        this.monsters.push(bird);
      } else {
        let bat = new Bat(this, x, y, Assets.Bat);
        bat.setDepth(1);
        bat.on(Events.MonsterDestroyed, this.handleMonsterDefeated, this);
        this.monsters.push(bat);
      }
    }

    this.generateFunction = () => {
      if (this.terrain) {
        this.physics.world.removeCollider(this.playerTerrainCollider);
        this.physics.world.removeCollider(this.monsterTerrainCollider);
        this.terrain.map.destroyLayer(this.terrain.layer);
      }

      if (this.jewels) {
        this.jewels.clear(true, true);
      }
      this.terrain = new Terrain(this);

      this.terrain.setDepth(0);
      this.physics.world.enable(this.terrain);

      this.addCollisions();

      this.physics.world.setBounds(
        0,
        0,
        this.terrain.map.widthInPixels,
        this.terrain.map.heightInPixels
      );

      Generate.create_objects(
        this,
        this.terrain.map_array,
        this.jewels,
        [Colors.CardinalRed, Colors.Yellow, Colors.LightBlue],
        data.gameSeed
      );
      if (this.player) {
        this.player.setDepth(2);
      }
    };

    const randomFrame = Phaser.Math.Between(0, 15);
    this.player = new Player(this, 72, 72, Assets.Characters, randomFrame);

    this.player.on(Events.HealthChanged, this.handleHealthChanged, this);

    this.keys = this.input.keyboard.addKeys("W,A,S,D,J,K,L,I");
    this.input.on(
      "pointerdown",
      pointer => this.player.handlePointerDown(pointer, this.terrain.map),
      this
    );

    this.jewels = this.physics.add.group();
    this.projectileGroup = new ProjectileGroup(this);
    this.enemyProjectiles = new EnemyProjectileGroup(this);

    this.directionToClosestEntity = null;
    this.graphics = this.add.graphics();
    this.debugRectangle = new Phaser.Geom.Rectangle(0, 0, 16, 16);

    this.monsters.forEach(monster => {
      monster.on(
        Events.FireProjectile,
        (monster, direction, min_attack, max_attack) => {
          this.enemyProjectiles.fireProjectile(
            monster.x,
            monster.y,
            direction,
            min_attack,
            max_attack
          );
        }
      );
    });

    this.addOverlaps();

    this.mobileDeviceSetup();

    const uiScene = this.scene.get(Scenes.UI);

    this.scene
      .get(Scenes.NewGameMenu)
      .events.on(Events.Generate, this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player, uiScene);
    playerCamera.setupCamera();

    // Collision Boxes for Debugging
    // this.physics.world.createDebugGraphic();
  }

  update() {
    if (data.gameActive) {
      this.player.update(
        this.keys.W.isDown,
        this.keys.A.isDown,
        this.keys.S.isDown,
        this.keys.D.isDown,
        Phaser.Input.Keyboard.JustDown(this.keys.I),
        Phaser.Input.Keyboard.JustDown(this.keys.J),
        Phaser.Input.Keyboard.JustDown(this.keys.K),
        Phaser.Input.Keyboard.JustDown(this.keys.L)
      );

      this.mobileAttackButton.setFillStyle(
        this.player.attacking ? Colors.Gold : Colors.DarkBlue
      );

      this.mobileAttackButton.setVisible(this.isMobile);

      if (
        this.player.attacking &&
        this.directionToClosestEntity &&
        this.player.cooldownCounter <= 0
      ) {
        this.attackAction();
      }

      this.monsters.forEach(monster => {
        monster.update();
      });

      this.monsters = this.monsters.filter(monster => monster.active);

      let closestEntity = null;
      let minDistance = Infinity;
      this.monsters.forEach(monster => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          monster.x,
          monster.y
        );
        if (distance <= 5 * this.tileWidth && distance < minDistance) {
          closestEntity = monster;
          minDistance = distance;
        }
      });

      if (closestEntity) {
        this.directionToClosestEntity = {
          x: closestEntity.x - this.player.x,
          y: closestEntity.y - this.player.y,
        };

        // Normalize the direction
        const magnitude = Math.sqrt(
          this.directionToClosestEntity.x * this.directionToClosestEntity.x +
            this.directionToClosestEntity.y * this.directionToClosestEntity.y
        );
        this.directionToClosestEntity.x /= magnitude;
        this.directionToClosestEntity.y /= magnitude;

        // Draw a 16x16 square at the monster's position
        this.drawDebugSquare(closestEntity);

        if (
          !this.closestEntity ||
          this.closestEntity.entityName !== closestEntity.entityName
        ) {
          this.closestEntity = closestEntity;
          this.events.emit(
            Events.ClosestEntityChanged,
            closestEntity.entityName
          );
        }
      } else {
        this.directionToClosestEntity = null;
        this.graphics.clear();

        if (this.closestEntity) {
          this.closestEntity = null;
          this.events.emit(Events.ClosestEntityChanged, "");
        }
      }
    }
  }

  drawDebugSquare(entity) {
    this.graphics.clear();
    this.graphics.lineStyle(1, Colors.Gold);
    this.debugRectangle.setPosition(entity.x - 8, entity.y - 8);
    this.graphics.strokeRectShape(this.debugRectangle);
  }

  addOverlaps() {
    this.physics.add.overlap(
      this.player,
      this.jewels,
      this.collectObject,
      null,
      this
    );

    this.physics.add.overlap(
      this.enemyProjectiles,
      this.player,
      this.playerHit,
      null,
      this
    );

    this.physics.add.overlap(
      this.projectileGroup,
      this.monsters,
      this.hitMonster,
      null,
      this
    );
  }

  addCollisions() {
    this.playerTerrainCollider = this.physics.add.collider(
      this.player,
      this.terrain.layer
    );

    // Filter out Bird instances
    this.collidableMonsters = this.monsters.filter(
      monster => !(monster instanceof Bird)
    );
    // Add colliders to non-Bird monsters

    this.monsterTerrainCollider = this.physics.add.collider(
      this.collidableMonsters,
      this.terrain.layer
    );
  }

  attackAction() {
    if (this.directionToClosestEntity) {
      // Fire the projectile towards the closest entity
      this.projectileGroup.fireProjectile(
        this.player.x,
        this.player.y,
        this.directionToClosestEntity
      );
    } else {
      // If there are no nearby entities, keep the current behavior
      let direction;
      switch (this.player.facing) {
        case "up":
          direction = { x: 0, y: -1 };
          break;
        case "down":
          direction = { x: 0, y: 1 };
          break;
        case "left":
          direction = { x: -1, y: 0 };
          break;
        case "right":
          direction = { x: 1, y: 0 };
          break;
      }
      this.projectileGroup.fireProjectile(
        this.player.x,
        this.player.y,
        direction
      );
    }
  }

  hitMonster(monster, projectile) {
    if (projectile.active) {
      projectile.disable();

      let randomDamage = Phaser.Math.Between(
        this.player.min_attack,
        this.player.max_attack
      );

      monster.takeDamage(randomDamage);

      let damageText = new DamageValue(
        this,
        monster.x,
        monster.y - 10,
        `${randomDamage}`
      );
    }
  }

  playerHit(player, projectile) {
    // choose an amount of damage between the projectile's min_attack and max_attack
    let projectileDamage = Phaser.Math.Between(
      projectile.min_attack,
      projectile.max_attack
    );

    // Play explosion animation
    // ...

    // Destroy the projectile
    projectile.destroy();

    // Player takes damage
    player.takeDamage(projectileDamage);

    // Create damage text with red color
    let damageText = new DamageValue(
      this,
      player.x,
      player.y - 10,
      `${projectileDamage}`,
      { color: "red" }
    );
  }

  handleHealthChanged(playerHealth) {
    // Emit a 'playerhealthchanged' event from the scene
    this.events.emit(Events.PlayerHealthChanged, playerHealth);
  }

  handleMonsterDefeated(monster) {
    this.events.emit(Events.PlayerMonstersDefeated, monster);
  }

  createAnimationKeys() {
    this.anims.create({
      key: Animations.FrogMove,
      frames: this.anims.generateFrameNumbers(Assets.Frog, {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
      repeat: -1,
    });
    AnimationKeys.push(Animations.FrogMove);

    this.anims.create({
      key: Animations.FrogIdle,
      frames: [{ key: Assets.Frog, frame: 0 }],
      frameRate: 10,
    });

    AnimationKeys.push(Animations.FrogIdle);

    this.anims.create({
      key: Animations.BirdMove,
      frames: this.anims.generateFrameNumbers(Assets.Bird, {
        start: 1,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });

    AnimationKeys.push(Animations.BirdMove);

    this.anims.create({
      key: Animations.BirdIdle,
      frames: [{ key: Assets.Bird, frame: 0 }],
      frameRate: 10,
    });

    AnimationKeys.push(Animations.BirdIdle);

    this.anims.create({
      key: Animations.BatMove,
      frames: this.anims.generateFrameNumbers(Assets.Bat, {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
      repeat: -1,
    });

    AnimationKeys.push(Animations.BatMove);

    this.anims.create({
      key: Animations.BatIdle,
      frames: [{ key: Assets.Bat, frame: 0 }],
      frameRate: 10,
    });

    AnimationKeys.push(Animations.BatIdle);

    this.anims.create({
      key: Animations.Explosion,
      frames: this.anims.generateFrameNumbers(Assets.Explosion, {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: 0,
    });
    AnimationKeys.push(Animations.Explosion);
  }

  collectObject(player, jewel) {
    if (data.gameActive) {
      jewel.destroy();

      this.player.collectedJewels++;
      this.events.emit(
        Events.PlayerJewelCollected,
        this.player.collectedJewels
      );
      this.player.takeDamage(-5);

      if (this.player.collectedJewels >= 30) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    data.gameActive = false;
    this.player.collectedJewels = 0;

    if (this.player) {
      this.player.setVisible(false);
      this.player.setActive(false);
    }

    Object.values(this.keys).forEach(key => {
      this.input.keyboard.removeCapture(key.keyCode);
    });

    this.scene.get(Scenes.UI).showGameOver();
  }

  mobileDeviceSetup() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.mobileAttackButton = this.add.rectangle(
      centerX - 128,
      centerY + 58,
      40,
      40,
      Colors.White
    );
    this.mobileAttackButton.setInteractive();
    this.mobileAttackButton.on(
      "pointerdown",
      function (pointer, localX, localY, event) {
        this.player.attacking = !this.player.attacking;
        event.stopPropagation();
      },
      this
    );

    this.mobileAttackButton.setScrollFactor(0);
    this.mobileAttackButton.setVisible(this.isMobile);
  }
}
