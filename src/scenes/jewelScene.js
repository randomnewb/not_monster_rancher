export default class Jewel extends Phaser.Physics.Arcade.Sprite {
  // should this be .Sprite or a GameObject?
  constructor(scene, x, y) {
    super(scene, x, y, "jewel");
  }
}
