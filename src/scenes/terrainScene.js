import { Scenes, Assets, Colors, Events } from "../utils/constants.js";
import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import seedrandom from "seedrandom";

export default class Terrain extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);

    this.map_array = Generate.placement_array(
      0,
      1,
      [2, 3, 4, 5, 6, 7],
      8,
      [9, 10, 11, 12, 13]
    );
    data.currentMapArray = this.map_array;

    this.map = scene.make.tilemap({
      data: this.map_array,
      tileWidth: 16,
      tileHeight: 16,
    });

    const tiles = this.map.addTilesetImage(Assets.FoliageTiles);
    this.layer = this.map.createLayer(0, tiles, 0, 0);
    this.layer.setCollision([8, 9]);

    // Define the indices for open tiles
    const openTiles = [0, 1, 2, 3, 4, 5, 6, 7];

    // Find an open tile
    let openTile = null;
    let openX = null;
    let openY = null;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.getTileAt(x, y);
        if (openTiles.includes(tile.index)) {
          // If the tile's index is included in the tiles array
          openTile = tile;
          openX = x;
          openY = y;
          break;
        }
      }
      if (openTile) break;
    }

    // Emit the 'mapArrayReady' event with the x and y position of the open tile
    this.scene.events.emit(Events.MapArrayReady, { x: openX, y: openY });

    /** Debug graphics 
    const debugGraphics = scene.add.graphics().setAlpha(0.75);
    this.map.renderDebug(debugGraphics, {
      tileColor: null, // Non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
    });
*/
    var dataLayer = this.layer.layer.data;
    var randomNumber = seedrandom(data.gameSeed);
    randomNumber();

    const grassTileColors = [
      Colors.Brown,
      Colors.DarkRed,
      Colors.Gold,
      Colors.LightGreen,
      Colors.DarkGreen,
      Colors.ForestGreen,
    ];

    const obstructionTileColors = [
      Colors.DarkRed,
      Colors.DarkBrown,
      Colors.LightGreen,
      Colors.DarkGreen,
      Colors.ForestGreen,
    ];

    const stoneTileColors = [
      Colors.LightGrey,
      Colors.Grey,
      Colors.DarkGrey,
      Colors.Navy,
      Colors.RoyalBlue,
    ];

    dataLayer.forEach(row => {
      row.forEach(tile => {
        if (
          tile.index === 1 ||
          tile.index === 5 ||
          tile.index === 6 ||
          tile.index === 7
        ) {
          tile.setAlpha(0.4);
          tile.tint =
            grassTileColors[
              Math.floor(randomNumber() * grassTileColors.length)
            ];
        } else if (tile.index === 2 || tile.index === 3 || tile.index === 4) {
          tile.setAlpha(0.4);
          tile.tint =
            stoneTileColors[
              Math.floor(randomNumber() * stoneTileColors.length)
            ];
        } else if (
          tile.index === 8 ||
          tile.index === 9 ||
          tile.index === 10 ||
          tile.index === 11 ||
          tile.index === 12 ||
          tile.index === 13
        ) {
          tile.tint =
            obstructionTileColors[
              Math.floor(randomNumber() * obstructionTileColors.length)
            ];
        }
      });
    });
  }
}
