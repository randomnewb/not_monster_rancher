import Phaser from "phaser";
import GameScene from "./scenes/gameScene.js";
import UIScene from "./scenes/uiScene.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    pixelArt: true,
    zoom: 2,
  },
  scene: [GameScene, UIScene],
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
