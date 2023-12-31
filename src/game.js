import { Colors } from "./utils/constants.js";
import Phaser from "phaser";
import GameScene from "./scenes/gameScene.js";
import UIScene from "./scenes/uiScene.js";
import MainMenuScene from "./scenes/mainMenuScene.js";
import NewGameMenuScene from "./scenes/newGameMenuScene.js";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin.js";

const config = {
  backgroundColor: Colors.Black,
  type: Phaser.AUTO,
  parent: "root",
  dom: {
    createContainer: true,
  },
  input: {
    mouse: {
      target: "root",
    },
    touch: {
      target: "root",
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    pixelArt: true,
    zoom: 2,
  },
  scene: [MainMenuScene, NewGameMenuScene, GameScene, UIScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 3,
  },
  plugins: {
    global: [
      {
        key: "rexInputTextPlugin",
        plugin: InputTextPlugin,
        start: true,
      },
    ],
  },
};

const game = new Phaser.Game(config);
