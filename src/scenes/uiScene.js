import data from "../data/data.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.gameWidth = this.game.config.width;
    this.gameHeight = this.game.config.height;

    this.gameOverText = this.add.text(
      180,
      100,
      "Game Over\n\nPlease Generate a\n New World to Play Again",
      {
        fontSize: "100px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );

    this.gameOverButton = this.add
      .text(235, 495, " Return to Main Menu ", {
        fontSize: "100px",
        fill: "black",
        align: "center",
        fontFamily: "HopeGold",
        backgroundColor: "lightblue",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        this.gameOverButton.setStyle({ fill: "#3d5a36" });
      })
      .on("pointerout", () => {
        this.gameOverButton.setStyle({ fill: "black" });
      })
      .on("pointerdown", () => {
        this.gameOverButton.setStyle({ fill: "#2e2740" });
      })
      .on("pointerup", () => {
        this.restartGame();
        this.gameOverButton.setStyle({ fill: "#10434e" });
      });

    this.gameOverText.setVisible(false);
    this.gameOverButton.setVisible(false);

    const gameScene = this.scene.get("GameScene");
    gameScene.events.on("playerHealthChanged", this.updateHealthText, this);
    gameScene.events.on("playerJewelCollected", this.updateJewelText, this);
    gameScene.events.on("playerFrogsFried", this.updateFrogsText, this);

    let playerHealth = 100; // replace this with the actual player's health

    this.playerHealthText = this.add.text(
      this.gameWidth / 2 - 220, // x position - center of the screen
      this.gameHeight - 50, // y position - bottom of the screen with some padding
      `Health: ${playerHealth}`, // text to display
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );

    let playerJewels = 0;

    this.playerJewelsText = this.add.text(
      this.gameWidth / 2 - 25, // x position - center of the screen
      this.gameHeight - 50, // y position - bottom of the screen with some padding
      `Jewels: ${playerJewels}`, // text to display
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );

    this.frogsFried = 0;

    this.playerFrogsFried = this.add.text(
      this.gameWidth / 2 + 120, // x position - center of the screen
      this.gameHeight - 50, // y position - bottom of the screen with some padding
      `Frogs Fried: ${this.frogsFried}`, // text to display
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );
  }

  updateHealthText(newHealth) {
    if (newHealth <= 0) {
      newHealth = 0;
    }

    if (newHealth >= data.playerMaxHealth) {
      newHealth = data.playerMaxHealth;
    }

    this.playerHealthText.setText(`Health: ${newHealth}`);
  }

  updateJewelText(newJewels) {
    this.playerJewelsText.setText(`Jewels: ${newJewels}`);
  }

  updateFrogsText() {
    this.frogsFried++;
    this.playerFrogsFried.setText(`Frogs Fried: ${this.frogsFried}`);
  }

  showGameOver() {
    this.gameOverText.setVisible(true);
    this.gameOverButton.setVisible(true);
  }

  restartGame() {
    this.add.rectangle(0, 0, 1280 * 2, 720 * 2, 0x000);
    const mainMenuScene = this.scene.get("MainMenuScene");
    mainMenuScene.scene.restart();

    this.scene.stop("GameScene");
    this.scene.stop("UIScene");
  }
}
