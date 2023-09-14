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
  }

  preload() {
    const tileWidth = 16;
    const tileHeight = 16;

    this.load.spritesheet("foliageTiles", "./assets/foliage.png", {
      frameWidth: tileWidth,
      frameHeight: tileHeight,
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
  }

  create() {
    const gameWidth = this.game.config.width;
    const gameHeight = this.game.config.height;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.rectangle = this.add.rectangle(
      centerX - 120,
      centerY + 42,
      30,
      30,
      0xffffff
    );
    this.rectangle.setInteractive();
    this.rectangle.on("pointerdown", () => this.action1());

    this.rectangle.setScrollFactor(0);

    this.joystick = this.plugins.get("rexVirtualJoystick").add(this, {
      x: gameWidth / 1.69,
      y: gameHeight / 1.8,
      radius: 17,
      base: this.add.circle(0, 0, 25, 0x888888),
      thumb: this.add.circle(0, 0, 12, 0xcccccc),
    });

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    this.joystick.setVisible(isMobile);
    this.rectangle.setVisible(isMobile);

    this.player = new Player(this, 72, 72, "player");

    this.frogs = [];

    for (let i = 0; i < 10; i++) {
      let x = Phaser.Math.Between(0, 400);
      let y = Phaser.Math.Between(0, 400);
      this.frogs.push(new Frog(this, x, y, "frog"));
    }

    this.anims.create({
      key: "frog_move",
      frames: this.anims.generateFrameNumbers("frog", { start: 0, end: 1 }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "frog_idle",
      frames: [{ key: "frog", frame: 0 }],
      frameRate: 10,
    });

    this.jewels = this.physics.add.group();
    this.projectileGroup = new ProjectileGroup(this);

    this.generateFunction = () => {
      if (this.terrain) {
        this.physics.world.removeCollider(this.playerTerrainCollider);
        this.terrain.map.destroyLayer(this.terrain.layer);
      }

      if (this.jewels) {
        this.jewels.clear(true, true);
      }
      this.terrain = new Terrain(this);
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
        this.player.setDepth(1);
      }
    };

    this.playerJewelOverlap = this.physics.add.overlap(
      this.player,
      this.jewels,
      this.collectObject,
      null,
      this
    );

    this.action1 = () => {
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
    };

    const uiScene = this.scene.get("UIScene");

    this.scene
      .get("NewGameMenuScene")
      .events.on("generate", this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player, uiScene);
    playerCamera.setupCamera();

    // Collision Boxes for Debugging
    // const debugGraphics = this.add.graphics();
    // this.terrain.layer.renderDebug(debugGraphics);

    // this.generateFunction();
  }

  update() {
    if (data.gameActive) {
      this.player.update();

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      this.joystick.setVisible(isMobile);
      this.rectangle.setVisible(isMobile);

      if (Phaser.Input.Keyboard.JustUp(this.player.keys.J)) {
        this.action1();
      }

      this.frogs.forEach(frog => {
        frog.update();
      });
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
