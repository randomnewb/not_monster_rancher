export default class HealthBar extends Phaser.GameObjects.Container {
  constructor(scene, x, y, health) {
    super(scene, x, y);

    this.scene = scene;
    this.maxHealth = health;
    this.currentHealth = health;

    this.backgroundBar = this.scene.add.rectangle(0, 0, 15, 1, 0x8b0000);
    this.healthBar = this.scene.add.rectangle(0, 0, 15, 1, 0xff0000);

    this.add(this.backgroundBar);
    this.add(this.healthBar);

    this.scene.add.existing(this);
  }

  updateHealth(health) {
    this.currentHealth = health;

    // Add check for negative health
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }

    if (this.currentHealth > this.maxHealth) {
      this.currentHealth = this.maxHealth;
    }

    this.healthBar.width = (this.currentHealth / this.maxHealth) * 15;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
