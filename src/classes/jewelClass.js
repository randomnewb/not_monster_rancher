import seedrandom from "seedrandom";

export default class Jewel extends Phaser.Physics.Arcade.Sprite {
  static randomNumber = null;

  constructor(scene, x, y, group, colorOptions, gameSeed) {
    super(scene, x, y, "jewel");
    scene.physics.world.enable(this);
    scene.add.existing(this);
    group.add(this);

    if (gameSeed !== undefined) {
      if (Jewel.randomNumber === null) {
        Jewel.randomNumber = seedrandom(gameSeed);
      }
      var randomValue = Jewel.randomNumber();
    } else {
      var randomValue = Math.random();
    }

    this.tint = colorOptions[Math.floor(randomValue * colorOptions.length)];
  }
}
