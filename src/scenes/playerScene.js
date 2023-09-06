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
    this.physics.world.enable(this.player);

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
    const TILE_SIZE = 16;
    const DURATION = 100; // Duration of the movement in milliseconds
    const OFFSET = 8;

    if (!this.player.isMoving) {
      let newX = this.player.x;
      let newY = this.player.y;

      // Calculate the next tile position
      const nextTileX = cursors.left.isDown
        ? this.tilePos.x - 1
        : this.tilePos.x + 1;
      const nextTileY = cursors.up.isDown
        ? this.tilePos.y - 1
        : this.tilePos.y + 1;

      if (cursors.left.isDown && this.tilePos.x - 1 >= 0) {
        this.tilePos.x -= 1;
        newX = this.tilePos.x * TILE_SIZE + OFFSET;
      } else if (cursors.right.isDown && this.tilePos.x + 1 < this.mapWidth) {
        this.tilePos.x += 1;
        newX = this.tilePos.x * TILE_SIZE + OFFSET;
      } else if (cursors.up.isDown && this.tilePos.y - 1 >= 0) {
        this.tilePos.y -= 1;
        newY = this.tilePos.y * TILE_SIZE + OFFSET;
      } else if (cursors.down.isDown && this.tilePos.y + 1 < this.mapHeight) {
        this.tilePos.y += 1;
        newY = this.tilePos.y * TILE_SIZE + OFFSET;
      }

      if (this.player.x !== newX || this.player.y !== newY) {
        this.player.isMoving = true;

        // Calculate the velocity needed to move the player to the next tile within the desired duration
        const velocityX = (newX - this.player.x) / (DURATION / 1000);
        const velocityY = (newY - this.player.y) / (DURATION / 1000);

        // Set the player's velocity
        this.player.setVelocity(velocityX, velocityY);

        // After the desired duration, stop the player and round its position to the nearest tile
        this.time.delayedCall(DURATION, () => {
          this.player.setVelocity(0, 0);
          this.player.x =
            Math.round((this.player.x - OFFSET) / TILE_SIZE) * TILE_SIZE +
            OFFSET;
          this.player.y =
            Math.round((this.player.y - OFFSET) / TILE_SIZE) * TILE_SIZE +
            OFFSET;
          this.player.isMoving = false;
        });
      }
    }
  }
}
