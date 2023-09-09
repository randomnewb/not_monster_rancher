export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.sprite = this.scene.physics.add
      .sprite(72, 72, "player")
      .setCollideWorldBounds();
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursorKeys = this.scene.joystick.createCursorKeys();

    this.collectedJewels = 0;
  }

  update() {
    this.sprite.body.setVelocity(0);

    // Use joystick
    if (this.cursorKeys) {
      if (this.cursorKeys.left.isDown) {
        this.sprite.body.setVelocityX(-100);
      } else if (this.cursorKeys.right.isDown) {
        this.sprite.body.setVelocityX(100);
      }

      if (this.cursorKeys.up.isDown) {
        this.sprite.body.setVelocityY(-100);
      } else if (this.cursorKeys.down.isDown) {
        this.sprite.body.setVelocityY(100);
      }
    }
    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.sprite.body.setVelocityX(-100);
    } else if (this.cursors.right.isDown) {
      this.sprite.body.setVelocityX(100);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.sprite.body.setVelocityY(-100);
    } else if (this.cursors.down.isDown) {
      this.sprite.body.setVelocityY(100);
    }
  }
}
