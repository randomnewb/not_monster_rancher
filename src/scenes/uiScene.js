import data from "../data/data.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene", active: true });
  }

  create() {
    this.gameWidth = this.game.config.width;
    this.gameHeight = this.game.config.height;

    this.gameOverText = this.add.text(
      1280 / 2,
      720 / 2,
      "Game Over\n\nPlease Generate a\n New World to Play Again",
      {
        fontSize: "80px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    this.restartButton = this.add
      .text(35, 50, " Generate World ", {
        fontSize: "25px",
        fill: "black",
        align: "center",
        fontFamily: "HopeGold",
        backgroundColor: "lightblue",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        this.restartButton.setStyle({ fill: "#3d5a36" });
      })
      .on("pointerout", () => {
        this.restartButton.setStyle({ fill: "black" });
      })
      .on("pointerdown", () => {
        this.restartButton.setStyle({ fill: "#2e2740" });
      })
      .on("pointerup", () => {
        this.restartGame();
        this.restartButton.setStyle({ fill: "#10434e" });
      })
      .setVisible(true);

    this.create_input_field();
    this.restartButton.visible = true;

    this.inputText.on(
      "keydown",
      function (inputText, e) {
        if (e.key === "Enter") {
          this.restartGame();
        }
      },
      this
    );
  }

  showGameOver() {
    this.gameOverText.setVisible(true);
    this.inputText.visible = true;
    this.restartButton.visible = true;
  }

  hideGameOver() {
    this.gameOverText.setVisible(false);
    this.inputText.visible = true;
  }

  restartGame() {
    if (!data.gameActive) {
      data.gameSeed = this.inputText.text;

      this.inputText.text = "";
      this.inputText.setBlur();
      this.events.emit("generate");

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
    this.inputText = this.add.rexInputText({
      x: 110,
      y: 15,
      width: 225,
      height: 35,
      type: "text",
      placeholder: "Please enter a seed",
      fontSize: "20px",
      maxLength: 10,
      backgroundColor: "lightblue",
      color: "black",
      align: "center",
      fontFamily: "HopeGold",
    });

    // this.inputText.node.style.backgroundColor = "lightblue";
  }
}
