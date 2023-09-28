export default class Jewel extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, group, colorOptions) {
    super(scene, x, y, "jewel");
    scene.physics.world.enable(this);
    scene.add.existing(this);
    group.add(this);

    var randomNumber = Math.random();
    if (randomNumber > 0.5) {
      this.tint = colorOptions.color1;
    } else if (randomNumber <= 0.5) {
      this.tint = colorOptions.color2;
    } else {
      this.tint = colorOptions.color3;
    }
  }
}
