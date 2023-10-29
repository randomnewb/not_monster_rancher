export default class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    scene.sys.updateList.add(this);
    scene.sys.displayList.add(this);
    scene.physics.world.enableBody(this);

    this.max_health = 100;
    this.min_attack = 1;
    this.max_attack = 1;
    this.level = 1;
  }

  levelUp() {
    this.level++;
    this.health += 20;
    this.attack += 5;
  }

  attackEntity(target) {
    if (target instanceof Entity) {
      target.takeDamage(this.attack);
    }
  }
}
