import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";
import Terrain from "./terrainScene.js";
import Player from "../scenes/playerScene.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene", active: true });
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
  }

  create() {
    const gameWidth = this.game.config.width;
    const gameHeight = this.game.config.height;

    this.joystick = this.plugins.get("rexVirtualJoystick").add(this, {
      x: gameWidth / 1.69,
      y: gameHeight / 1.8,
      radius: 17,
      base: this.add.circle(0, 0, 25, 0x888888),
      thumb: this.add.circle(0, 0, 12, 0xcccccc),
    });

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    this.joystick.setVisible(isMobile);

    this.player = new Player(this);

    this.jewels = this.physics.add.group();

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
        Generate.placement_array(0, 1),
        this.jewels,
        "jewel",
        {
          color1: 0x7e8bfe,
          color2: 0x7efeb8,
          color3: 0xfe7e7e,
        }
      );
    };

    this.playerJewelOverlap = this.physics.add.overlap(
      this.player.sprite,
      this.jewels,
      this.collectObject,
      null,
      this
    );

    const uiScene = this.scene.get("UIScene");

    this.scene
      .get("UIScene")
      .events.on("generate", this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player.sprite, uiScene);
    playerCamera.setupCamera();

    // Collision Boxes for Debugging
    // const debugGraphics = this.add.graphics();
    // this.terrain.layer.renderDebug(debugGraphics);

    // phaser 3 js, lock player within confines of the map
  }

  update() {
    this.player.update();

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    this.joystick.setVisible(isMobile);
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
