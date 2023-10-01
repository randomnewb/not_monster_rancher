import { Scenes, Assets, Colors, Events } from "../utils/constants.js";
import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";
import Terrain from "./terrainScene.js";
import Player from "../classes/playerClass.js";
import Frog from "../classes/frogClass.js";
import DamageValue from "../classes/damageValueClass.js";
import { ProjectileGroup } from "../scripts/projectileGroup.js";
import { EnemyProjectileGroup } from "../scripts/enemyProjectileGroup.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: Scenes.Game, active: false });
    this.tileWidth = 16;
    this.tileHeight = 16;
  }

  preload() {
    this.load.spritesheet(Assets.FoliageTiles, "./assets/foliage.png", {
      frameWidth: this.tileWidth,
      frameHeight: this.tileHeight,
    });

    this.load.spritesheet(Assets.Characters, "./assets/characters.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(Assets.Frog, "./assets/frog.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(Assets.EnemyAttack1, "./assets/enemy_attack1.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image(Assets.Jewel, "./assets/jewel.png");

    this.load.spritesheet(Assets.Projectiles, "./assets/projectiles.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(Assets.Weapons, "./assets/weaponSheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(Assets.Explosion, "./assets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet(Assets.Reactions, "./assets/reactions.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
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

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    this.mobileAttackButton.setScrollFactor(0);
    this.mobileAttackButton.setVisible(isMobile);

    this.frogs = [];
    for (let i = 0; i < 100; i++) {
      let x = Phaser.Math.Between(0, 1024);
      let y = Phaser.Math.Between(0, 1024);
      this.frogs.push(new Frog(this, x, y, Assets.Frog));
    }

    if (!this.anims.exists("frog_move")) {
      this.anims.create({
        key: "frog_move",
        frames: this.anims.generateFrameNumbers(Assets.Frog, {
          start: 0,
          end: 1,
        }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!this.anims.exists("frog_idle")) {
      this.anims.create({
        key: "frog_idle",
        frames: [{ key: Assets.Frog, frame: 0 }],
        frameRate: 10,
      });
    }

    if (!this.anims.exists(Assets.Explosion)) {
      this.anims.create({
        key: "explosion",
        frames: this.anims.generateFrameNumbers(Assets.Explosion, {
          start: 0,
          end: 5,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    this.generateFunction = () => {
      if (this.terrain) {
        this.physics.world.removeCollider(this.playerTerrainCollider);
        this.physics.world.removeCollider(this.frogTerrainCollider);
        this.terrain.map.destroyLayer(this.terrain.layer);
      }

      if (this.jewels) {
        this.jewels.clear(true, true);
      }
      this.terrain = new Terrain(this);

      this.terrain.setDepth(0);
      this.physics.world.enable(this.terrain);

      this.playerTerrainCollider = this.physics.add.collider(
        this.player,
        this.terrain.layer
      );

      this.frogTerrainCollider = this.physics.add.collider(
        this.frogs,
        this.terrain.layer
      );

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

    this.jewels = this.physics.add.group();
    this.projectileGroup = new ProjectileGroup(this);
    this.enemyProjectiles = new EnemyProjectileGroup(this);

    this.playerJewelOverlap = this.physics.add.overlap(
      this.player,
      this.jewels,
      this.collectObject,
      null,
      this
    );

    this.directionToClosestEntity = null;
    this.graphics = this.add.graphics();
    this.debugRectangle = new Phaser.Geom.Rectangle(0, 0, 16, 16);

    this.attackAction = () => {
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
    };

    this.frogs.forEach(frog => {
      frog.on(
        Events.FireProjectile,
        (frog, direction, min_attack, max_attack) => {
          this.enemyProjectiles.fireProjectile(
            frog.x,
            frog.y,
            direction,
            min_attack,
            max_attack
          );
        }
      );
    });

    this.physics.add.overlap(
      this.enemyProjectiles,
      this.player,
      playerHit,
      null,
      this
    );

    this.physics.add.overlap(
      this.projectileGroup,
      this.frogs,
      hitFrog,
      null,
      this
    );

    function playerHit(player, projectile) {
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

    function hitFrog(frog, projectile) {
      if (projectile.active) {
        projectile.disable();

        let randomDamage = Phaser.Math.Between(
          this.player.min_attack,
          this.player.max_attack
        );

        frog.takeDamage(randomDamage);

        let damageText = new DamageValue(
          this,
          frog.x,
          frog.y - 10,
          `${randomDamage}`
        );
      }
    }

    this.frogs.forEach(frog => {
      frog.on(Events.FrogDestroyed, this.handleFrogFried, this);
    });

    const uiScene = this.scene.get(Scenes.UI);

    this.scene
      .get(Scenes.NewGameMenu)
      .events.on(Events.Generate, this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player, uiScene);
    playerCamera.setupCamera();

    // Collision Boxes for Debugging
    // this.physics.world.createDebugGraphic();

    // this.generateFunction();
  }

  handleHealthChanged(playerHealth) {
    // Emit a 'playerhealthchanged' event from the scene
    this.events.emit(Events.PlayerHealthChanged, playerHealth);
  }

  handleFrogFried(frog) {
    this.events.emit(Events.PlayerFrogsFried, frog);
  }

  update() {
    if (data.gameActive) {
      this.player.update();

      if (this.player.attacking) {
        this.mobileAttackButton.setFillStyle(Colors.Gold);
      } else {
        this.mobileAttackButton.setFillStyle(Colors.DarkBlue);
      }

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      this.mobileAttackButton.setVisible(isMobile);

      if (
        this.player.attacking &&
        this.directionToClosestEntity &&
        this.player.cooldownCounter <= 0
      ) {
        this.attackAction();
      }

      this.frogs.forEach(frog => {
        frog.setDepth(1);
        frog.update();
      });

      this.frogs = this.frogs.filter(frog => frog.active);
      const nearbyEntities = this.frogs.filter(frog => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          frog.x,
          frog.y
        );
        // distance between closest frog and player
        return distance <= 5 * this.tileWidth;
      });

      // If there are nearby entities, find the closest one
      if (nearbyEntities.length > 0) {
        const closestEntity = nearbyEntities.reduce((closest, entity) => {
          const distanceToCurrent = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
            entity.x,
            entity.y
          );
          const distanceToClosest = closest
            ? Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                closest.x,
                closest.y
              )
            : Infinity;
          return distanceToCurrent < distanceToClosest ? entity : closest;
        }, null);

        // Calculate the direction towards the closest entity
        this.directionToClosestEntity = {
          x: closestEntity.x - this.player.x,
          y: closestEntity.y - this.player.y,
        };

        // draw a 16x16 at that frog's position
        this.graphics.clear();
        this.graphics.lineStyle(1, Colors.Gold);
        this.debugRectangle.setPosition(
          closestEntity.x - 8,
          closestEntity.y - 8
        );
        this.graphics.strokeRectShape(this.debugRectangle);

        // Normalize the direction
        const magnitude = Math.sqrt(
          this.directionToClosestEntity.x * this.directionToClosestEntity.x +
            this.directionToClosestEntity.y * this.directionToClosestEntity.y
        );
        this.directionToClosestEntity.x /= magnitude;
        this.directionToClosestEntity.y /= magnitude;
      } else {
        this.directionToClosestEntity = null;
        this.graphics.clear();
      }
    } else {
      this.player.body.setVelocity(0);
    }
  }

  collectObject(player, jewel) {
    if (data.gameActive) {
      jewel.destroy();

      this.player.collectedJewels++;
      this.events.emit(
        Events.PlayerJewelCollected,
        this.player.collectedJewels
      );
      this.player.takeDamage(-10);

      if (this.player.collectedJewels >= 20) {
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

    Object.values(this.scene.scene.player.keys).forEach(key => {
      this.input.keyboard.removeCapture(key.keyCode);
    });

    this.scene.get(Scenes.UI).showGameOver();
  }
}
