import data from "../data/data.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene", active: true });
  }

  create() {
    const player = this.scene.get("PlayerScene");
    const objects = this.scene.get("ObjectScene");

    this.collectedObjects = 0;

    this.physics.add.collider(player, objects, this.collectObject, null, this);
  }

  collectObject(player, object) {
    if (!data.gameActive) {
      object.destroy();
      this.collectedObjects++;

      if (this.collectedObjects >= 10) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    this.scene.get("UIScene").showGameOver();
    data.gameActive = true;
  }

  restartGame() {
    this.scene.get("GameScene").scene.restart();
    this.scene.get("UIScene").hideGameOver();
    data.gameActive = false;
  }
}
