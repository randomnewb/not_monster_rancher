import data from "../data/data.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene", active: true });
  }

  create() {
    this.gameOverText = this.add.text(
      320,
      240,
      "Game Over\nPress R to Restart",
      {
        fontSize: "24px",
        fill: "#fff",
        align: "center",
      }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    if (!data.gameActive) {
      this.input.keyboard.on("keydown-R", this.restartGame, this);
    }
  }

  showGameOver() {
    this.gameOverText.setVisible(true);
  }

  hideGameOver() {
    this.gameOverText.setVisible(false);
  }

  restartGame() {
    this.scene.get("GameScene").scene.restart();
    this.hideGameOver();
    data.gameActive = false;
  }
}
