import seedrandom from "seedrandom";

export default class BackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: "BackgroundScene", active: true });
  }

  preload() {
    const tileWidth = 16;
    const tileHeight = 16;

    this.load.spritesheet("foliageTiles", "./assets/foliage.png", {
      frameWidth: tileWidth,
      frameHeight: tileHeight,
    });
  }

  create() {
    this.tileWidth = 16;
    this.tileHeight = 16;
    this.userSeed = null;
    // this.drawMap(this.automata_126(this.generateMap(5254967991)));
    // this.drawMap(this.generateMap("5254967992"));

    // this.camera = this.cameras.main;

    // this.camera.setZoom(3.0);
    // this.camera.setBounds(0, 0, 640, 480);

    // this.camera.startFollow(this.player);

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Enter seed";
    document.body.appendChild(this.input);

    const canvas = document.querySelector("canvas");
    const canvasPosition = canvas.getBoundingClientRect();
    this.input.style.position = "absolute";
    this.input.style.top = `${canvasPosition.top + 10}px`;
    this.input.style.left = `${canvasPosition.left + 10}px`;
    this.input.style.width = "100px";
    this.input.style.height = "25px";

    this.input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        this.drawMap(this.generateMap(this.input.value));
        this.userSeed = this.input.value;

        this.events.emit("emitSeed", { bgSeed: this.userSeed });

        this.input.value = "";
      }
    });
  }

  update() {}

  drawMap = map => {
    this.children.removeAll();

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        const tile = this.add.sprite(
          column * this.tileWidth + 8,
          row * this.tileHeight + 8,
          "foliageTiles",
          map[row][column]
        );
      }
    }
  };

  generateMap = seed => {
    const randomNumber = seedrandom(seed);
    let map = [];
    for (let row = 0; row < 32; row++) {
      let newRow = [];
      for (let column = 0; column < 40; column++) {
        if (randomNumber() > 0.5) {
          newRow.push(0);
        } else {
          newRow.push(1);
        }
      }
      map.push(newRow);
    }

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        if (map[row][column] === 1 && randomNumber() < 0.5) {
          map[row][column] = 2;
        }
      }
    }

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        if (map[row][column] === 2 && randomNumber() > 0.8) {
          map[row][column] = 8;
        } else if (
          map[row][column] === 2 &&
          randomNumber() >= 0.8 &&
          randomNumber() < 0.99
        ) {
          map[row][column] = 9;
        }
      }
    }

    return map;
  };

  automata_126 = map => {
    let newMap = [];
    for (let row = 0; row < map.length; row++) {
      let newRow = [];
      for (let column = 0; column < map[row].length; column++) {
        let neighbors = 0;
        if (map[row - 1] && map[row - 1][column - 1] === 1) {
          neighbors++;
        }
        if (map[row - 1] && map[row - 1][column] === 1) {
          neighbors++;
        }
        if (map[row - 1] && map[row - 1][column + 1] === 1) {
          neighbors++;
        }
        if (map[row] && map[row][column - 1] === 1) {
          neighbors++;
        }
        if (map[row] && map[row][column + 1] === 1) {
          neighbors++;
        }
        if (map[row + 1] && map[row + 1][column - 1] === 1) {
          neighbors++;
        }
        if (map[row + 1] && map[row + 1][column] === 1) {
          neighbors++;
        }
        if (map[row + 1] && map[row + 1][column + 1] === 1) {
          neighbors++;
        }
        if (map[row][column] === 0 && neighbors === 3) {
          newRow.push(1);
        } else if (
          (map[row][column] === 1 && neighbors === 2) ||
          neighbors === 3
        ) {
          newRow.push(1);
        } else {
          newRow.push(0);
        }
      }
      newMap.push(newRow);
    }
    return newMap;
  };
}
