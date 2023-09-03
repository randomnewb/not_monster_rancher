import data from "../data/data.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene", active: true });
  }

  preload() {
    this.load.image("object", "../assets/object.png");
  }

  create() {
    const player = this.scene.get("PlayerScene");
    console.log(player);
    this.collectedObjects = 0;

    this.objects = this.physics.add.group({
      key: "object",
      repeat: 9,
      setXY: { x: 136, y: 136, stepX: 16 },
    });

    this.physics.add.collider(
      player,
      this.objects,
      this.collectObject,
      null,
      this
    );
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
