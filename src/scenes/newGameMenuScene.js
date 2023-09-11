import data from "../data/data.js";

export default class NewGameMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "NewGameMenuScene" });
  }

  create() {
    this.generateWorldButton = this.createButton(
      195,
      440,
      " Generate World ",
      () => {
        this.startGame();
      }
    );

    this.create_input_field();

    this.inputText.on(
      "keydown",
      function (inputText, e) {
        if (e.key === "Enter") {
          this.startGame();
        }
      },
      this
    );
  }

  startGame() {
    this.add.rectangle(0, 0, 1280 * 2, 720 * 2, 0x000);
    const gameScene = this.scene.get("GameScene");
    gameScene.scene.restart();

    const uiScene = this.scene.get("UIScene");
    uiScene.scene.restart();

    this.time.delayedCall(250, () => {
      this.events.emit("generate");
      this.scene.stop("NewGameMenuScene");
    });

    this.inputText.visible = false;
    this.generateWorldButton.visible = false;
    data.gameSeed = this.inputText.text;
    this.inputText.text = "";
    this.inputText.setBlur();

    data.gameActive = true;
  }

  createButton(x, y, text, clickAction) {
    let button = this.add
      .text(x, y, text, {
        fontSize: "150px",
        fill: "black",
        align: "center",
        fontFamily: "HopeGold",
        backgroundColor: "lightblue",
      })
      .setInteractive({ useHandCursor: true });

    button
      .on("pointerover", () => {
        button.setStyle({ fill: "#3d5a36" });
      })
      .on("pointerout", () => {
        button.setStyle({ fill: "black" });
      })
      .on("pointerdown", () => {
        button.setStyle({ fill: "#2e2740" });
      })
      .on("pointerup", () => {
        clickAction();
        button.setStyle({ fill: "#10434e" });
      });

    return button;
  }
  create_input_field() {
    this.inputText = this.add.rexInputText({
      x: 665,
      y: 150,
      width: 800,
      height: 100,
      type: "text",
      placeholder: "Please enter a seed",
      fontSize: "100px",
      maxLength: 10,
      backgroundColor: "lightblue",
      color: "black",
      align: "center",
      fontFamily: "HopeGold",
    });
  }
}
