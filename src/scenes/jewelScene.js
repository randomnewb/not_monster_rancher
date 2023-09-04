export default class Jewel extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "jewel");
  }

  changeColor(color) {
    this.tint = color;
  }
}
Phaser.GameObjects.GameObjectFactory.register("jewel", function (x, y) {
  var jewel = new Jewel(this.scene, x, y);

  this.displayList.add(jewel);
  this.updateList.add(jewel);

  return jewel;
});
