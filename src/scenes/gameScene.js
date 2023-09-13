import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";
import Terrain from "./terrainScene.js";
import Player from "../scenes/playerScene.js";
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

    this.player = new Player(this);
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
        this.player.sprite,
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
        this.player.sprite.setDepth(1);
      }
    };

    this.playerJewelOverlap = this.physics.add.overlap(
      this.player.sprite,
      this.jewels,
      this.collectObject,
      null,
      this
    );

    this.action1 = () => {
      // console.log("event received and firing");
      // Get direction based on player's last movement
      console.log(this.player.facing);
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
        this.player.sprite.x,
        this.player.sprite.y,
        direction
      );
    };

    const uiScene = this.scene.get("UIScene");

    this.scene
      .get("NewGameMenuScene")
      .events.on("generate", this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player.sprite, uiScene);
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

      // this.actionButton1.on("click", function () {
      //   console.log("Action 1");
      // });
    } else {
      this.player.sprite.body.setVelocity(0);
    }

    // if (this.player.keys.J.isDown) {
    //   this.action1();
    // }
  }

  collectObject(player, jewel) {
    if (data.gameActive) {
      jewel.destroy();

      this.player.collectedJewels++;

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
