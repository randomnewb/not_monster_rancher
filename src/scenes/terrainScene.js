import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import seedrandom from "seedrandom";

export default class Terrain extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);

    var randomNumber = seedrandom(data.gameSeed);

    this.map_array = Generate.placement_array(0, 1, 2, 8, 9);
    data.currentMapArray = this.map_array;
    this.scene.events.emit("mapArrayReady");

    this.map = scene.make.tilemap({
      data: this.map_array,
      tileWidth: 16,
      tileHeight: 16,
    });

    const tiles = this.map.addTilesetImage("foliageTiles");
    this.layer = this.map.createLayer(0, tiles, 0, 0);
    this.layer.setCollision([8, 9]);

    /** Debug graphics 
    const debugGraphics = scene.add.graphics().setAlpha(0.75);
    this.map.renderDebug(debugGraphics, {
      tileColor: null, // Non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
    });
*/
    var dataLayer = this.layer.layer.data;

    const grassTileColors = [
      0x8fce00, 0x80b900, 0x72a400, 0x649000, 0x557b00, 0xbf9000, 0xab8100,
    ];

    const obstructionTileColors = [
      0x38761d, 0x326a1a, 0x2c5e17, 0x275214, 0x214611,
    ];

    const stoneTileColors = [0x5b5b5b, 0x515151, 0x484848, 0x3f3f3f, 0x363636];

    dataLayer.forEach(row => {
      row.forEach(tile => {
        if (tile.index === 1) {
          tile.tint =
            grassTileColors[
              Math.floor(randomNumber() * grassTileColors.length)
            ];
        } else if (tile.index === 2) {
          tile.tint =
            stoneTileColors[
              Math.floor(randomNumber() * stoneTileColors.length)
            ];
        } else if (tile.index === 8 || tile.index === 9) {
          tile.tint =
            obstructionTileColors[
              Math.floor(randomNumber() * obstructionTileColors.length)
            ];
        }
      });
    });
  }
}
