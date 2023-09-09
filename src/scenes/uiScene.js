import data from "../data/data.js";
import InputText from "phaser3-rex-plugins/plugins/inputtext.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene", active: true });
  }

  create() {
    // access phaser 3 js config file
    this.gameWidth = this.game.config.width;
    this.gameHeight = this.game.config.height;

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
    this.create_restart_button();

    this.inputText.on(
      "keydown",
      function (inputText, e) {
        if (e.key === "Enter") {
          data.gameSeed = this.inputText.text;

          this.events.emit("generate");

          this.inputText.text = "";
          this.inputText.visible = false;
          this.inputText.setBlur();
        }
      },
      this
    );

    // this.inputText.on("keydown", event => {
    //   if (event.key === "Enter") {
    //     data.gameSeed = this.input.value;

    //     this.events.emit("generate");

    //     this.inputText.text = "";
    //   }
    // });
  }

  showGameOver() {
    this.gameOverText.setVisible(true);
    this.inputText.visible = true;
    this.button.style.display = "block";
  }

  hideGameOver() {
    this.gameOverText.setVisible(false);
    this.button.style.display = "none";
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
    });

    // this.inputText.node.style.backgroundColor = "lightblue";
  }

  create_restart_button() {
    // create a button and add it to the DOM
    this.button = document.createElement("button");
    this.button.innerHTML = "Restart";
    document.body.appendChild(this.button);

    // set the button position
    const canvas = document.querySelector("canvas");
    const canvasPosition = canvas.getBoundingClientRect();
    this.button.style.position = "absolute";
    this.button.style.top = `${canvasPosition.top}px`;
    this.button.style.left = `${canvasPosition.left * 100.0}px`;

    this.button.style.width = "250px";
    this.button.style.height = "50px";

    // add a listener to the button
    this.button.addEventListener("click", () => {
      this.restartGame();
    });

    // this.button.style.display = "none";
  }
}
