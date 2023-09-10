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
        console.log("Generate World");
      }
    );
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
}
