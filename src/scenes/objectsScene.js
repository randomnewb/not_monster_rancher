import seedrandom from "seedrandom";

export default class ObjectScene extends Phaser.Scene {
  constructor() {
    super({ key: "ObjectScene", active: true });
  }

  preload() {
    this.load.image("object", "./assets/object.png");
  }

  create() {
    const background = this.scene.get("BackgroundScene");

    this.tileWidth = 16;
    this.tileHeight = 16;

    this.objects;

    background.events.on(
      "emitSeed",
      function (data) {
        this.objects = this.drawObjectMap(this.generateObjectMap(data.bgSeed));
      },
      this
    );

    this.objects = this.physics.add.sprite(8 + 64, 8 + 64, "object");
  }

  // generate a map of objects based on the seed
  // where 1 is the object and 0 is empty space
  // the max number of objects is 10
  // after the max number of objects is reached, fill the remaining empty space with 0s
  // increase the object count by 1 every time a 1 is added
  generateObjectMap = seed => {
    const randomNumber = seedrandom(seed);
    let objectCount = 0;
    let map = [];

    for (let row = 0; row < 32; row++) {
      let newRow = [];
      for (let column = 0; column < 40; column++) {
        if (randomNumber() > 0.5 && objectCount < 10) {
          newRow.push(1);
          if (objectCount < 10) {
            objectCount++;
          }
        } else {
          newRow.push(0);
        }
      }
      map.push(newRow);
    }

    return map;
  };

  // the drawObjectMap function creates an object only where there is a 1 in the map
  drawObjectMap = map => {
    this.objects;

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        if (map[row][column] === 1) {
          this.objects = this.physics.add.sprite(
            column * this.tileWidth + 8,
            row * this.tileHeight + 8,
            "object"
          );
        }
      }
    }
    return this.objects;
  };
}
