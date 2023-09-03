import data from "../data/data.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("player", "../assets/player.png");
    this.load.image("object", "../assets/object.png");
  }

  create() {
    this.collectedObjects = 0;

    this.velocity = 300;

    this.player = this.physics.add.sprite(75, 75, "player");
    this.objects = this.physics.add.group({
      key: "object",
      repeat: 9,
      setXY: { x: 10, y: 10, stepX: 20 },
    });

    this.physics.add.collider(
      this.player,
      this.objects,
      this.collectObject,
      null,
      this
    );

    this.camera = this.cameras.main;

    this.camera.setZoom(3.0);
    this.camera.setBounds(0, 0, 640, 480);

    this.camera.startFollow(this.player);
  }

  update() {
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      this.camera.worldView.x + 10,
      this.camera.worldView.right - 10
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y,
      this.camera.worldView.y + 10,
      this.camera.worldView.bottom - 10
    );

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

  collectObject(player, object) {
    if (!data.gameActive) {
      object.destroy();
      this.collectedObjects++;

      if (this.collectedObjects >= 10) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    this.scene.get("UIScene").showGameOver();
    data.gameActive = true;
  }

  restartGame() {
    this.scene.get("GameScene").scene.restart();
    this.scene.get("UIScene").hideGameOver();
    data.gameActive = false;
  }
}
