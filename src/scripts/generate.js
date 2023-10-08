import data from "../data/data.js";
import seedrandom from "seedrandom";
import Jewel from "../classes/jewelClass.js";

export default class Generate {
  static create_objects(scene, map, objects, colorOptions, gameSeed) {
    var randomNumber = seedrandom(gameSeed);
    randomNumber();

    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        if (map[row][column] === 0 && randomNumber() < 0.05) {
          new Jewel(
            scene,
            column * 16 + 8,
            row * 16 + 8,
            objects,
            colorOptions,
            gameSeed
          );
        }
      }
    }
  }

  /**
   *
   * Generates a 2D array of integers representing a 64x64 map
   *
   * Takes two arrays of integers representing the walkable and obstruction frame values from a tilesheet
   *
   * @param {integer} walkable - Integer representing the walkable space frame value (such as 1, 2, 3, 4, etc.)
   * @param {integer} obstruction - Integer representing the obstruction frame value (such as 8, 9, 10, 11, etc.)
   *
   * @returns {array} - 2D array of integers representing a map
   */

  static placement_array(walkable = [], obstruction = []) {
    var randomNumber = seedrandom(data.gameSeed);
    randomNumber();

    let map = [];

    for (let row = 0; row < 64; row++) {
      let newRow = [];
      for (let column = 0; column < 64; column++) {
        if (randomNumber() > 0.5) {
          newRow.push(0); // empty index is always 0
        } else {
          newRow.push(walkable[0]); // the first index in the walkable array will be the initial walkable value for generation
        }
      }
      map.push(newRow);
    }

    replaceWithWalkable();
    replaceWithObstruction();

    function replaceWithWalkable() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (map[row][column] === walkable[0] && randomNumber() < 0.5) {
            map[row][column] =
              // choose one walkable variant from the range of walkable variants in its array
              walkable[Math.floor(randomNumber() * walkable.length)];
          }
        }
      }
    }

    function replaceWithObstruction() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (walkable.includes(map[row][column]) && randomNumber() > 0.8) {
            map[row][column] =
              // choose one obstruction from the range of obstructions in its array
              obstruction[Math.floor(randomNumber() * obstruction.length)];
          }
        }
      }
    }

    return map;
  }
}
