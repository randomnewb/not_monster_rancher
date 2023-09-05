import PlayerCamera from "../scripts/playerCamera.js";

export default class PlayerScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayerScene", active: true });
  }

  preload() {
    this.load.image("player", "./assets/player.png");
  }

  create() {
    this.TILE_SIZE = 16;
    this.OFFSET = 8;
    this.mapWidth = 40;
    this.mapHeight = 30;

    this.tilePos = { x: 5, y: 5 };
    this.player = this.physics.add.sprite(0, 0, "player");

    this.player.setPosition(
      this.tilePos.x * this.TILE_SIZE + this.OFFSET,
      this.tilePos.y * this.TILE_SIZE + this.OFFSET
    );

    const uiScene = this.scene.get("UIScene");

    const playerCamera = new PlayerCamera(this, this.player, uiScene);
    playerCamera.setupCamera();
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown && !this.leftKeyDown) {
      this.leftKeyDown = true;

      if (this.tilePos.x - 1 >= 0) {
        this.tilePos.x -= 1;
        this.player.x = this.tilePos.x * this.TILE_SIZE + this.OFFSET;
      } else if (this.tilePos.x - 1 < 0) {
        console.log("left edge");
      }
    } else if (cursors.right.isDown && !this.rightKeyDown) {
      this.rightKeyDown = true;

      if (this.tilePos.x + 1 < this.mapWidth) {
        this.tilePos.x += 1;
        this.player.x = this.tilePos.x * this.TILE_SIZE + this.OFFSET;
      } else if (this.tilePos.x + 1 >= this.mapWidth) {
        console.log("right edge");
      }
    } else if (cursors.up.isDown && !this.upKeyDown) {
      this.upKeyDown = true;

      if (this.tilePos.y - 1 >= 0) {
        this.tilePos.y -= 1;
        this.player.y = this.tilePos.y * this.TILE_SIZE + this.OFFSET;
      } else if (this.tilePos.y - 1 < 0) {
        console.log("top edge");
      }
    } else if (cursors.down.isDown && !this.downKeyDown) {
      this.downKeyDown = true;

      if (this.tilePos.y + 1 < this.mapHeight) {
        this.tilePos.y += 1;
        this.player.y = this.tilePos.y * this.TILE_SIZE + this.OFFSET;
      } else if (this.tilePos.y + 1 >= this.mapHeight) {
        console.log("bottom edge");
      }
    }

    if (cursors.left.isUp) {
      this.leftKeyDown = false;
    }
    if (cursors.right.isUp) {
      this.rightKeyDown = false;
    }
    if (cursors.up.isUp) {
      this.upKeyDown = false;
    }
    if (cursors.down.isUp) {
      this.downKeyDown = false;
    }
  }
}
