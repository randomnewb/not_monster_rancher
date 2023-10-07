import {
  Scenes,
  Assets,
  Colors,
  Events,
  grassTileColors,
  treeTileColors,
  stoneTileColors,
  walkableTiles,
  obstructionTiles,
  rockTileColors,
} from "../utils/constants.js";
import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import seedrandom from "seedrandom";
import TileMetaData from "../utils/TileMetaData.js";

export default class Terrain extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);

    this.TileMetaData = new Map();

    this.map_array = Generate.placement_array(walkableTiles, obstructionTiles);

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

    dataLayer.forEach(row => {
      row.forEach(tile => {
        if ([8, 9, 10, 11, 12, 13].includes(tile.index)) {
          const tilesetImage = "Assets.FoliageTiles"; // replace with actual value
          const lifeSkillsType = "woodcutting"; // replace with actual value
          const health = 100; // replace with actual value
          const durability = 100; // replace with actual value
          const metadata = new TileMetaData(
            tilesetImage,
            tile.index,
            lifeSkillsType,
            health,
            durability
          );
          this.TileMetaData.set(tile, metadata);

          // Set the treeTileColors for the tile
          tile.tint =
            treeTileColors[Math.floor(randomNumber() * treeTileColors.length)];
        } else if ([0, 1, 5, 6, 7].includes(tile.index)) {
          const tilesetImage = "Assets.FoliageTiles"; // replace with actual value
          const lifeSkillsType = "none"; // replace with actual value
          const health = 0; // replace with actual value
          const durability = 0; // replace with actual value
          const metadata = new TileMetaData(
            tilesetImage,
            tile.index,
            lifeSkillsType,
            health,
            durability
          );
          this.TileMetaData.set(tile, metadata);

          // Set the grassTileColors for the tile
          tile.setAlpha(0.4);
          tile.tint =
            grassTileColors[
              Math.floor(randomNumber() * grassTileColors.length)
            ];
        } else if ([24, 25, 26, 27, 28, 29, 30, 31].includes(tile.index)) {
          const tilesetImage = "Assets.FoliageTiles"; // replace with actual value
          const lifeSkillsType = "mining"; // replace with actual value
          const health = 100; // replace with actual value
          const durability = 100; // replace with actual value
          const metadata = new TileMetaData(
            tilesetImage,
            tile.index,
            lifeSkillsType,
            health,
            durability
          );
          this.TileMetaData.set(tile, metadata);

          // Set the rockTileColors for the tile
          tile.tint =
            rockTileColors[Math.floor(randomNumber() * rockTileColors.length)];
        } else if (tile.index === 2 || tile.index === 3 || tile.index === 4) {
          tile.setAlpha(0.4);
          tile.tint =
            stoneTileColors[
              Math.floor(randomNumber() * stoneTileColors.length)
            ];
        }
      });
    });
  }
}
