import Phaser from "phaser";
import Generate from "../scripts/generate.js";
import data from "../data/data.js";

export default class Terrain extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);

    // Create the tilemap
    this.exampleMap = scene.make.tilemap({
      data: Generate.placement_array(data.gameSeed, 40, 30, 0, 1, 2, 8, 9),
      tileWidth: 16,
      tileHeight: 16,
    });

    const tiles = this.exampleMap.addTilesetImage("foliageTiles");
    this.layer = this.exampleMap.createLayer(0, tiles, 0, 0);
    this.layer.setCollision([8, 9]);
  }
}
