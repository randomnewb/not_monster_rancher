export default class PlayerScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayerScene", active: true });
  }

  preload() {
    this.load.image("player", "../assets/player.png");
  }

  create() {
    this.player = this.physics.add.sprite(75, 75, "player");

    this.velocity = 100;
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
      this.player.setVelocityX(-this.velocity);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(this.velocity);
    } else {
      this.player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
      this.player.setVelocityY(-this.velocity);
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(this.velocity);
    } else {
      this.player.setVelocityY(0);
    }
  }
}
