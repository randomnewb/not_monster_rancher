export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.sprite = this.scene.physics.add
      .sprite(72, 72, "player")
      .setCollideWorldBounds();
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursorKeys = this.scene.joystick.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,J,K,L,I");

    this.collectedJewels = 0;

    this.sprite.tint = 0x2986cc;
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
    if (
      this.cursors.left.isDown ||
      // implement WASD controls
      this.keys.A.isDown
    ) {
      this.sprite.body.setVelocityX(-100);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.sprite.body.setVelocityX(100);
    }

    // Vertical movement
    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.sprite.body.setVelocityY(-100);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.sprite.body.setVelocityY(100);
    }

    // Future Actions to Implement
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) {
      console.log("Open inventory...");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
      console.log("Action 1");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
      console.log("Action 2");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
      console.log("Action 3");
    }
  }
}
