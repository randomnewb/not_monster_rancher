import Phaser from "phaser";
import GameScene from "./scenes/gameScene.js";
import PlayerScene from "./scenes/playerScene.js";
import BackgroundScene from "./scenes/backgroundScene.js";
import UIScene from "./scenes/uiScene.js";

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
  scene: [PlayerScene, GameScene, BackgroundScene, UIScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
