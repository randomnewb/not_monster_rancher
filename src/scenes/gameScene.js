import data from "../data/data.js";
import Jewel from "../scenes/jewelScene.js";

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
    const jewels = this.physics.add.group({ classType: Jewel });

    for (let i = 0; i < 10; i++) {
      const jewel = jewels.create(
        Phaser.Math.Clamp(Math.floor(Math.random() * 40) * 16 + 8, 16, 624),
        Phaser.Math.Clamp(Math.floor(Math.random() * 30) * 16 + 8, 16, 464),
        "jewel"
      );

      if (Math.random() > 0.5) {
        jewel.changeColor(0x7e8bfe);
      } else {
        jewel.changeColor(0x7efeb8);
      }
    }

    this.collectedJewels = 0;

    this.physics.add.collider(player, jewels, this.collectObject, null, this);
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
    this.scene.get("UIScene").showGameOver();
  }
}
