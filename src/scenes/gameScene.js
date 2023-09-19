import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";
import Terrain from "./terrainScene.js";
import Player from "../classes/playerClass.js";
import Frog from "../classes/frogClass.js";
import { ProjectileGroup } from "../scripts/projectileGroup.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene", active: false });
    this.tileWidth = 16;
    this.tileHeight = 16;
  }

  preload() {
    this.load.spritesheet("foliageTiles", "./assets/foliage.png", {
      frameWidth: this.tileWidth,
      frameHeight: this.tileHeight,
    });

    this.load.image("player", "./assets/player.png");
    this.load.spritesheet("frog", "./assets/frog.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image("jewel", "./assets/jewel.png");
    this.load.spritesheet("projectile", "./assets/projectiles.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("weapons", "./assets/weaponSheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("explosion", "./assets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.rectangle = this.add.rectangle(
      centerX - 128,
      centerY + 58,
      40,
      40,
      0xffffff
    );
    this.rectangle.setInteractive();
    this.rectangle.on(
      "pointerdown",
      function (pointer, localX, localY, event) {
        this.action1();
        event.stopPropagation();
      },
      this
    );

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    this.rectangle.setScrollFactor(0);
    this.rectangle.setVisible(isMobile);

    this.frogs = [];
    for (let i = 0; i < 100; i++) {
      let x = Phaser.Math.Between(0, 1024);
      let y = Phaser.Math.Between(0, 1024);
      this.frogs.push(new Frog(this, x, y, "frog"));
    }

    if (!this.anims.exists("frog_move")) {
      this.anims.create({
        key: "frog_move",
        frames: this.anims.generateFrameNumbers("frog", { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!this.anims.exists("frog_idle")) {
      this.anims.create({
        key: "frog_idle",
        frames: [{ key: "frog", frame: 0 }],
        frameRate: 10,
      });
    }

    if (!this.anims.exists("explosion")) {
      this.anims.create({
        key: "explosion",
        frames: this.anims.generateFrameNumbers("explosion", {
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
        "jewel",
        {
          color1: 0x7e8bfe,
          color2: 0x7efeb8,
          color3: 0xfe7e7e,
        }
      );
      if (this.player) {
        this.player.setDepth(2);
      }
    };

    this.player = new Player(this, 72, 72, "player");

    this.jewels = this.physics.add.group();
    this.projectileGroup = new ProjectileGroup(this);

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

    this.action1 = () => {
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

    this.physics.add.overlap(
      this.projectileGroup,
      this.frogs,
      hitFrog,
      null,
      this
    );

    function hitFrog(frog, projectile) {
      if (projectile.active) {
        projectile.disable();

        frog.takeDamage(1);
      }
    }
    const uiScene = this.scene.get("UIScene");

    this.scene
      .get("NewGameMenuScene")
      .events.on("generate", this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player, uiScene);
    playerCamera.setupCamera();

    // Collision Boxes for Debugging
    // this.physics.world.createDebugGraphic();

    // this.generateFunction();
  }

  update() {
    if (data.gameActive) {
      this.player.update();

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      // this.joystick.setVisible(isMobile);
      this.rectangle.setVisible(isMobile);

      if (Phaser.Input.Keyboard.JustUp(this.player.keys.J)) {
        this.action1();
      }

      this.frogs.forEach(frog => {
        frog.setDepth(1);
        frog.update();
      });

      this.frogs = this.frogs.filter(frog => frog.active);
      // Get all entities within 3 tiles distance
      const nearbyEntities = this.frogs.filter(frog => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          frog.x,
          frog.y
        );

        return distance <= 3 * this.tileWidth;
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
        this.graphics.lineStyle(1, 0xffff00);
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
      this.player.takeDamage(-10);

      if (this.player.collectedJewels >= 10) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    data.gameActive = false;
    this.player.collectedJewels = 0;

    this.scene.get("UIScene").showGameOver();
  }
}

/** joystick code

create() {
  this.joystick = this.plugins.get("rexVirtualJoystick").add(this, {
    x: gameWidth / 1.69,
    y: gameHeight / 1.8,
    radius: 17,
    base: this.add.circle(0, 0, 25, 0x888888),
    thumb: this.add.circle(0, 0, 12, 0xcccccc),
  });

this.joystick.setVisible(isMobile);
}

 */
