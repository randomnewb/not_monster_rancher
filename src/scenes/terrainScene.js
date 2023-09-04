import data from "../data/data.js";
import Generate from "../scripts/generate.js";

export default class TerrainScene extends Phaser.Scene {
  constructor() {
    super({ key: "TerrainScene", active: true });
  }

  preload() {
    const tileWidth = 16;
    const tileHeight = 16;

    this.load.spritesheet("foliageTiles", "./assets/foliage.png", {
      frameWidth: tileWidth,
      frameHeight: tileHeight,
    });
  }

  create() {
    this.tileSize = 16;
    this.userSeed = null;

    this.generateFunction = () => {
      Generate.draw_map(
        Generate.placement_array(data.gameSeed, 40, 30, 0, 1, 2, 8, 9),
        "foliageTiles",
        this.tileSize,
        this
      );
    };

    this.scene
      .get("UIScene")
      .events.on("generate", this.generateFunction, this);
  }
}
