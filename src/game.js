import Phaser from "phaser";
import style from "../main.css";
import GameScene from "./scenes/gameScene.js";
import PlayerScene from "./scenes/playerScene.js";
import ObjectScene from "./scenes/objectsScene.js";
import TerrainScene from "./scenes/terrainScene.js";
import UIScene from "./scenes/uiScene.js";
import GenerateMap from "./scripts/generateMap.js";

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
    PlayerScene,
    GameScene,
    ObjectScene,
    TerrainScene,
    UIScene,
    GenerateMap,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

const game = new Phaser.Game(config);
