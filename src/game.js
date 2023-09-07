import Phaser from "phaser";
import style from "../main.css";
import GameScene from "./scenes/gameScene.js";
import ObjectScene from "./scenes/objectsScene.js";
import UIScene from "./scenes/uiScene.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 480,
    pixelArt: true,
    zoom: 2,
  },
  scene: [
    GameScene,
    // ObjectScene,
    UIScene,
    // Generate,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  plugins: {
    global: [
      {
        key: "rexVirtualJoystick",
        plugin: VirtualJoystickPlugin,
        start: true,
      },
    ],
  },
};

const game = new Phaser.Game(config);
