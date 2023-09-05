import data from "../data/data.js";
import seedrandom from "seedrandom";

export default class Generate {
  static create_objects(map, seed, scene, objects, objectName, colorOptions) {
    const randomNumber = seedrandom(seed);

    scene.children.removeAll();

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        if (map[row][column] === 0 && randomNumber() < 0.05) {
          const object = objects.create(
            column * 16 + 8,
            row * 16 + 8,
            objectName
          );

          if (randomNumber() > 0.5) {
            object.changeColor(colorOptions.color1);
          } else if (randomNumber() <= 0.5) {
            object.changeColor(colorOptions.color2);
          } else {
            object.changeColor(colorOptions.color3);
          }
        }
      }
    }
  }

  /**
   *
   * Draws the map of tiles to the scene
   *
   * @param {array} map - 2D array of integers representing a map
   * @param {*} tilesheet - Phaser tileset spritesheet
   * @param {*} tile_size - Integer representing the tile size
   * @param {*} scene - Phaser scene to draw the map to
   */

  static draw_map(map, tilesheet, tile_size, scene) {
    scene.children.removeAll();

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        const tile = scene.add.sprite(
          column * tile_size + 8,
          row * tile_size + 8,
          tilesheet,
          map[row][column]
        );
      }
    }
  }

  /**
   *
   * Generates a 2D array of integers representing a map
   *
   * Given an area, 640x480, with a tile size of 16x16, there would be 40 tiles wide and 30 tiles high
   *
   * Given a tilesheet with these frame values:
   *
   * 0 = empty space
   *
   * 1 = walkable space like grass
   *
   * 2 = walkable space variant like dirt/small rocks
   *
   * 8 = obstruction like tree
   *
   * 9 = obstruction variant like a different tree or large rock
   *
   *
   * @param {string} seed - Any length and characters
   * @param {integer} width - Integer Greater than 1
   * @param {integer} height - Integer Greater than 1
   * @param {integer} empty - Integer representing the empty space frame value (usually: 0)
   * @param {integer} walkable - Integer representing the walkable space frame value (usually: 1)
   * @param {integer} walkableVariant - Integer representing the walkable space variant frame value (usually: 2)
   * @param {integer} obstruction - Integer representing the obstruction frame value (usually: 8)
   * @param {integer} obstructionVariant - Integer representing the obstruction variant frame value (usually: 9)
   *
   * @returns {array} - 2D array of integers representing a map
   */

  static placement_array(
    seed,
    width,
    height,
    empty,
    walkable,
    walkableVariant,
    obstruction,
    obstructionVariant
  ) {
    // const empty = 0;
    // const walkable = 1;
    // const walkableVariant = 2;
    // const obstruction = 8;
    // const obstructionVariant = 9;

    const randomNumber = seedrandom(seed);
    let map = [];
    for (let row = 0; row < height; row++) {
      let newRow = [];
      for (let column = 0; column < width; column++) {
        if (randomNumber() > 0.5) {
          newRow.push(empty);
        } else {
          newRow.push(walkable);
        }
      }
      map.push(newRow);
    }

    if (walkableVariant) {
      replaceWithWalkable();
      replaceWithObstruction();
    }

    function replaceWithWalkable() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (map[row][column] === walkable && randomNumber() < 0.5) {
            map[row][column] = walkableVariant;
          }
        }
      }
    }

    function replaceWithObstruction() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (map[row][column] === walkableVariant && randomNumber() > 0.8) {
            map[row][column] = obstruction;
          } else if (
            map[row][column] === 2 &&
            randomNumber() >= 0.8 &&
            randomNumber() < 0.99
          ) {
            map[row][column] = obstructionVariant;
          }
        }
      }
    }

    return map;
  }
}