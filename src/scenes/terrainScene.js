import data from "../data/data.js";
import Generate from "../scripts/generate.js";
import PlayerCamera from "../scripts/playerCamera.js";

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
    const playerScene = this.scene.get("PlayerScene");
    const player = playerScene.player;

    this.scene
      .get("UIScene")
      .events.on("generate", this.generateFunction, this);

    const uiScene = this.scene.get("UIScene");

    const playerCamera = new PlayerCamera(this, player, uiScene);
    playerCamera.setupCamera();
  }

  generateFunction = () => {
    const playerScene = this.scene.get("PlayerScene");
    const player = playerScene.player;

    this.exampleMap = this.make.tilemap({
      data: Generate.placement_array(data.gameSeed, 40, 30, 0, 1, 2, 8, 9),
      tileWidth: 16,
      tileHeight: 16,
    });

    this.exampleMap.setCollision([8, 9]);
    const tiles = this.exampleMap.addTilesetImage("foliageTiles");
    this.layer = this.exampleMap.createLayer(0, tiles, 0, 0);

    this.physics.world.enable(this.layer);

    const debugGraphics = this.add.graphics();
    this.layer.renderDebug(debugGraphics);

    this.physics.add.collider(player, this.layer, function (player, tile) {
      if (tile.index === 8 || tile.index === 9) {
        console.log("Collision with tile detected!");
      }
    });

    this.isLayerCreated = true;
  };
}
