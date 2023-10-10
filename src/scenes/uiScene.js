import { Scenes, Assets, Events, AnimationKeys } from "../utils/constants.js";
import data from "../data/data.js";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  preload() {
    this.load.spritesheet(
      Assets.AutoAttackIndicator,
      "./assets/auto_attack_indicator.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );
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
        backgroundColor: "#0099db",
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        this.gameOverButton.setStyle({ fill: "#733e39" });
      })
      .on("pointerout", () => {
        this.gameOverButton.setStyle({ fill: "black" });
      })
      .on("pointerdown", () => {
        this.gameOverButton.setStyle({ fill: "#f77622" });
      })
      .on("pointerup", () => {
        this.restartGame();
        this.gameOverButton.setStyle({ fill: "#3a4466" });
      });

    this.gameOverText.setVisible(false);
    this.gameOverButton.setVisible(false);

    const gameScene = this.scene.get(Scenes.Game);
    gameScene.events.on(
      Events.PlayerHealthChanged,
      this.updateHealthText,
      this
    );
    // gameScene.events.on(
    //   Events.PlayerJewelCollected,
    //   this.updateJewelText,
    //   this
    // );
    // gameScene.events.on(
    //   Events.PlayerMonstersDefeated,
    //   this.updateMonstersDefeatedText,
    //   this
    // );
    gameScene.events.on(
      Events.ClosestEntityChanged,
      this.updateMonsterNameText,
      this
    );
    gameScene.events.on(Events.PlayerLevelChanged, this.updateLevelText, this);
    gameScene.events.on(Events.PlayerExpChanged, this.updateExpText, this);

    let playerHealth = 0; // replace this with the actual player's health
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

    // let playerJewels = 0;
    // this.playerJewelsText = this.add.text(
    //   this.gameWidth / 2 - 30, // x position - center of the screen
    //   this.gameHeight - 50, // y position - bottom of the screen with some padding
    //   `Jewels: ${playerJewels}`, // text to display
    //   {
    //     fontSize: "32px",
    //     fill: "#fff",
    //     align: "center",
    //     fontFamily: "HopeGold",
    //   }
    // );

    let playerLevel = 0; // replace this with the actual player's level
    this.playerLevelText = this.add.text(
      this.gameWidth / 2 - 30, // x position - center of the screen
      this.gameHeight - 50, // y position - bottom of the screen with some padding
      `Level: ${playerLevel}`, // text to display
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );

    let playerExp = 0; // replace this with the actual player's experience
    this.playerExpText = this.add.text(
      this.gameWidth / 2 + 120, // x position - center of the screen
      this.gameHeight - 50, // y position - bottom of the screen with some padding
      `Exp: ${playerExp}`, // text to display
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );

    // this.monstersDefeated = 0;
    // this.playerMonstersDefeated = this.add.text(
    //   this.gameWidth / 2 + 120, // x position - center of the screen
    //   this.gameHeight - 50, // y position - bottom of the screen with some padding
    //   `Monsters Defeated: ${this.monstersDefeated}`, // text to display
    //   {
    //     fontSize: "32px",
    //     fill: "#fff",
    //     align: "center",
    //     fontFamily: "HopeGold",
    //   }
    // );

    this.monsterName = "";
    this.monsterNameText = this.add.text(
      this.gameWidth / 2 - 65, // x position - center of the screen
      this.gameHeight - 100, // y position - bottom of the screen with some padding
      `Monster Name: ${this.monsterName}`, // text to display
      {
        fontSize: "32px",
        fill: "#fff",
        align: "center",
        fontFamily: "HopeGold",
      }
    );

    this.autoAttackIndicator = this.add.sprite(64, 64, "auto_attack_indicator");
    this.autoAttackIndicator.setScale(4); // 2 is the zoom level, increase to zoom in more
  }

  update() {
    const gameScene = this.scene.get(Scenes.Game);

    if (gameScene.player) {
      this.autoAttackIndicator.setFrame(
        gameScene.player.stateMachine.stateName === "attacking" ? 0 : 1
      );
    }
  }

  updateHealthText(newHealth) {
    if (newHealth <= 0) {
      newHealth = 0;
    }

    // if (newHealth >= data.playerMaxHealth) {
    //   newHealth = data.playerMaxHealth;
    // }

    this.playerHealthText.setText(`Health: ${newHealth}`);
  }

  // updateJewelText(newJewels) {
  //   this.playerJewelsText.setText(`Jewels: ${newJewels}`);
  // }

  // updateMonstersDefeatedText() {
  //   this.monstersDefeated++;
  //   this.playerMonstersDefeated.setText(
  //     `Monsters Defeated: ${this.monstersDefeated}`
  //   );
  // }

  updateMonsterNameText(newName) {
    this.monsterNameText.setText(`Monster Name: ${newName}`);
  }

  updateLevelText(newLevel) {
    this.playerLevelText.setText(`Level: ${newLevel}`);
  }

  updateExpText(newExp) {
    this.playerExpText.setText(`Exp: ${newExp}`);
  }

  showGameOver() {
    this.gameOverText.setVisible(true);
    this.gameOverButton.setVisible(true);
  }

  restartGame() {
    this.add.rectangle(0, 0, 1280 * 2, 720 * 2, 0x000);
    this.removeEventListeners();
    const mainMenuScene = this.scene.get(Scenes.MainMenu);
    mainMenuScene.scene.restart();

    AnimationKeys.forEach(key => {
      if (this.anims.exists(key)) {
        this.anims.remove(key);
      }
    });

    this.scene.stop(Scenes.Game);
    this.scene.stop(Scenes.UI);
  }

  removeEventListeners() {
    const gameScene = this.scene.get(Scenes.Game);
    gameScene.events.off(
      Events.PlayerHealthChanged,
      this.updateHealthText,
      this
    );
    // gameScene.events.off(
    //   Events.PlayerJewelCollected,
    //   this.updateJewelText,
    //   this
    // );
    // gameScene.events.off(
    //   Events.PlayerMonstersDefeated,
    //   this.updateMonstersDefeatedText,
    //   this
    // );
    gameScene.events.off(
      Events.ClosestEntityChanged,
      this.updateMonsterNameText,
      this
    );
    gameScene.events.off(Events.PlayerLevelChanged, this.updateLevelText, this);
    gameScene.events.off(Events.PlayerExpChanged, this.updateExpText, this);
  }
}
