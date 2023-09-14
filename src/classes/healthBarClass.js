export default class HealthBar {
  constructor(scene, x, y, max_health, health) {
    this.bar = new Phaser.GameObjects.Graphics(scene);

    this.x = x;
    this.y = y;
    this.max_value = max_health;
    this.value = health;
    this.filledProportion = this.value / this.max_value;

    this.draw();

    scene.add.existing(this.bar);
  }

  decrease(health) {
    this.value = health;

    if (this.value < 0) {
      this.value = 0;
    }

    this.filledProportion = this.value / this.max_value;

    this.draw();

    return this.value === 0;
  }

  draw() {
    this.bar.clear();

    //  BG
    this.bar.fillStyle(0x000000);
    this.bar.fillRect(0, 0, 50, 6);

    //  Health
    this.bar.fillStyle(0xffffff);
    this.bar.fillRect(0, 0, 38, 3);

    if (this.value < 10) {
      this.bar.fillStyle(0xff0000);
    } else {
      this.bar.fillStyle(0x00ff00);
    }

    var filledWidth = Math.floor(this.filledProportion * this.value); // changed 'p' to 'filledProportion'

    this.bar.fillRect(0, 0, filledWidth, 3);
  }

  setPosition(x, y) {
    this.bar.x = x;
    this.bar.y = y;
  }
}
