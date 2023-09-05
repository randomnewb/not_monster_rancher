import data from "../data/data.js";
import Jewel from "../scenes/jewelScene.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene", active: true });
  }

  preload() {
    this.load.image("jewel", "./assets/jewel.png");
  }

  create() {
    const playerScene = this.scene.get("PlayerScene");
    const player = playerScene.player;
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

    this.scene
      .get("UIScene")
      .events.on("generate", this.generateFunction, this);

    this.collectedJewels = 0;

    this.physics.add.collider(player, jewels, this.collectObject, null, this);

    const playerCamera = new PlayerCamera(this, player, uiScene);
    playerCamera.setupCamera();
  }

  collectObject(player, jewels) {
    if (data.gameActive) {
      jewels.destroy();
      this.collectedJewels++;

      if (this.collectedJewels >= 10) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    data.gameActive = false;
    this.collectedJewels = 0;
    this.scene.get("UIScene").showGameOver();
  }
}
