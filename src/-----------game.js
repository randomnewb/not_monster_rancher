import Phaser from "phaser";

class Example extends Phaser.Scene {
  showDebug = false;
  player;
  cursors;
  map;

  preload() {
    this.load.image(
      "tiles",
      "./assets/tilemaps/tiles/catastrophi_tiles_16.png"
    );
    this.load.tilemapCSV("map", "./assets/tilemaps/csv/catastrophi_level2.csv");
    this.load.spritesheet("player", "./assets/sprites/spaceman.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    this.map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });
    const tileset = this.map.addTilesetImage("tiles");
    this.layer = this.map.createLayer(0, tileset, 0, 0);

    //  This isn't totally accurate, but it'll do for now
    this.map.setCollisionBetween(54, 83);

    this.player = this.physics.add.sprite(50, 100, "player", 1);

    // Set up the player to collide with the tilemap layer. Alternatively, you can manually run
    // collisions in update via: this.physics.world.collide(player, layer).
    this.physics.add.collider(this.player, this.layer);

    // this.cameras.main.setBounds(
    //   0,
    //   0,
    //   this.map.widthInPixels,
    //   this.map.heightInPixels
    // );
    // this.cameras.main.startFollow(this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // this.physics.world.collide(this.player, this.layer);
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-100);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(100);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-100);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(100);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#2d2d2d",
  parent: "phaser-example",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: Example,
};

const game = new Phaser.Game(config);
