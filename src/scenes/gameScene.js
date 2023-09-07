import data from "../data/data.js";
import Jewel from "../scenes/jewelScene.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";
import Terrain from "../scripts/terrain.js";
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
    this.terrain = new Terrain(this);
    this.physics.world.enable(this.terrain);

    this.joystick = this.plugins.get("rexVirtualJoystick").add(this, {
      x: 430,
      y: 310,
      radius: 25,
      base: this.add.circle(0, 0, 40, 0x888888),
      thumb: this.add.circle(0, 0, 20, 0xcccccc),
    });

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    this.joystick.setVisible(isMobile);

    this.player = new Player(this);

    const uiScene = this.scene.get("UIScene");

    const jewels = this.physics.add.group({ classType: Jewel });

    this.generateFunction = () => {
      Generate.create_objects(
        Generate.placement_array(data.gameSeed, 40, 30, 0, 1),
        data.gameSeed,
        this,
        jewels,
        "jewel",
        {
          color1: 0x7e8bfe,
          color2: 0x7efeb8,
          color3: 0xfe7e7e,
        }
      );
    };

    this.physics.add.collider(
      this.player,
      jewels,
      this.collectObject,
      null,
      this
    );

    this.collectedJewels = 0;

    this.scene
      .get("UIScene")
      .events.on("generate", this.generateFunction, this);

    const playerCamera = new PlayerCamera(this, this.player.sprite, uiScene);
    playerCamera.setupCamera();

    const debugGraphics = this.add.graphics();
    this.terrain.layer.renderDebug(debugGraphics);

    this.physics.add.collider(this.player.sprite, this.terrain.layer);
  }

  update() {
    this.player.update();

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    this.joystick.setVisible(isMobile);
  }
}
