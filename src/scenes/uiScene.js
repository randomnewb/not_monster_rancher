import data from "../data/data.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene", active: true });
  }

  create() {
    this.gameOverText = this.add.text(
      1280 / 2,
      720 / 2,
      "Game Over\nPress R to Restart",
      {
        fontSize: "80px",
        fill: "#fff",
        align: "center",
      }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    this.input.keyboard.on("keydown-R", this.restartGame, this);

    this.create_input_field();

    this.input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        data.gameSeed = this.input.value;

        this.events.emit("generate");

        this.input.value = "";
      }
    });
  }

  showGameOver() {
    this.gameOverText.setVisible(true);
  }

  hideGameOver() {
    this.gameOverText.setVisible(false);
  }

  restartGame() {
    if (!data.gameActive) {
      data.gameActive = true;

      const gameScene = this.scene.get("GameScene");
      // const terrainScene = this.scene.get("TerrainScene");

      // Remove the event listeners
      this.events.off("generate", gameScene.generateFunction, gameScene);
      // this.events.off("generate", terrainScene.generateFunction, terrainScene);

      // Restart the scenes
      gameScene.scene.restart();
      // terrainScene.scene.restart();

      this.hideGameOver();
    }
  }

  create_input_field() {
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Enter seed";
    document.body.appendChild(this.input);

    const canvas = document.querySelector("canvas");
    const canvasPosition = canvas.getBoundingClientRect();
    this.input.style.position = "absolute";
    this.input.style.top = `${canvasPosition.top + 10}px`;
    this.input.style.left = `${canvasPosition.left + 10}px`;
    this.input.style.width = "100px";
    this.input.style.height = "25px";
  }
}
