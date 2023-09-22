export default class DamageValue extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style = {}) {
    // Set default style values
    style.fontSize = style.fontSize || "15px";
    style.fontFamily = style.fontFamily || "HopeGold";
    style.color = style.color || "yellow";

    super(scene, x, y, text, style);

    // Add this text to the scene
    scene.add.existing(this);

    // Move up and fade out
    scene.tweens.add({
      targets: this,
      y: y - 50,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: function (tween, targets, text) {
        text.destroy();
      },
      onCompleteParams: [this],
    });
  }
}
