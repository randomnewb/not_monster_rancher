export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene", active: true });
  }

  create() {
    const player = this.scene.get("GameScene").player;
    console.log(player);
    if (player) {
      player.destroy();
    }

    this.newGameButton = this.createButton(250, 50, " New Game ", () => {
      const newGameMenuScene = this.scene.get("NewGameMenuScene");
      newGameMenuScene.scene.restart();

      this.scene.bringToTop("NewGameMenuScene");
      this.scene.stop("MainMenuScene");
    });

    this.optionsButton = this.createButton(290, 280, " Options ", () => {
      console.log("Options");
    });

    this.exitGameButton = this.createButton(220, 510, " Exit Game ", () => {
      console.log("Exit Game");
    });
  }

  update() {}

  createButton(x, y, text, clickAction) {
    let button = this.add
      .text(x, y, text, {
        fontSize: "200px",
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
}
