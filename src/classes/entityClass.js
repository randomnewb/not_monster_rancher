export default class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    // Add this entity to the scene
    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    // Initialize stats
    this.max_health = 100;
    this.attack = 10;
    this.level = 1;
  }

  // Method to increase level
  levelUp() {
    this.level++;
    this.health += 20; // Increase health by 20 each level
    this.attack += 5; // Increase attack by 5 each level
  }

  // Method to take damage
  takeDamage(damage) {
    this.current_health -= damage;
    if (this.current_health < 0) {
      this.current_health = 0;
    }
  }

  // Method to attack another entity
  attackEntity(target) {
    if (target instanceof Entity) {
      target.takeDamage(this.attack);
    }
  }
}
