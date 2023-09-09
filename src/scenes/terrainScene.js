import Generate from "../scripts/generate.js";

export default class Terrain extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);

    this.map = scene.make.tilemap({
      data: Generate.placement_array(0, 1, 2, 8, 9),
      tileWidth: 16,
      tileHeight: 16,
    });

    const tiles = this.map.addTilesetImage("foliageTiles");
    this.layer = this.map.createLayer(0, tiles, 0, 0);
    this.layer.setCollision([8, 9]);
  }
}
