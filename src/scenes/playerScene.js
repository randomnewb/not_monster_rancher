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
    this.tilePos = { x: 5, y: 5 };
    this.player = this.physics.add.sprite(0, 0, "player");

    this.player.setPosition(
      this.tilePos.x * this.TILE_SIZE + this.OFFSET,
      this.tilePos.y * this.TILE_SIZE + this.OFFSET
    );
    // this.velocity = 100;
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown && !this.leftKeyDown) {
      this.leftKeyDown = true;
      this.tilePos.x -= 1;
      this.player.x = this.tilePos.x * this.TILE_SIZE + this.OFFSET;
    } else if (cursors.right.isDown && !this.rightKeyDown) {
      this.rightKeyDown = true;
      this.tilePos.x += 1;
      this.player.x = this.tilePos.x * this.TILE_SIZE + this.OFFSET;
    } else if (cursors.up.isDown && !this.upKeyDown) {
      this.upKeyDown = true;
      this.tilePos.y -= 1;
      this.player.y = this.tilePos.y * this.TILE_SIZE + this.OFFSET;
    } else if (cursors.down.isDown && !this.downKeyDown) {
      this.downKeyDown = true;
      this.tilePos.y += 1;
      this.player.y = this.tilePos.y * this.TILE_SIZE + this.OFFSET;
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

    // implement a click to move system
  }
}
