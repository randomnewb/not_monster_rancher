import data from "../data/data.js";
import seedrandom from "seedrandom";
import Jewel from "../classes/jewelClass.js";

export default class Generate {
  static create_objects(scene, map, objects, colorOptions, gameSeed) {
    var randomNumber = seedrandom(gameSeed);
    randomNumber();

    console.log("createobjects", randomNumber());

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
   * Given a tilesheet with these frame index values:
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
   * @param {integer} empty - Integer representing the empty space frame value (usually: 0)
   * @param {integer} walkable - Integer representing the walkable space frame value (usually: 1)
   * @param {integer} walkableVariant - Integer representing the walkable space variant frame value (usually: 2)
   * @param {integer} obstruction - Integer representing the obstruction frame value (usually: 8)
   * @param {integer} obstructionVariant - Integer representing the obstruction variant frame value (usually: 9)
   *
   * @returns {array} - 2D array of integers representing a map
   */

  static placement_array(
    empty,
    walkable,
    walkableVariant,
    obstruction,
    obstructionVariant
  ) {
    var randomNumber = seedrandom(data.gameSeed);
    randomNumber();
    // const empty = 0;
    // const walkable = 1;
    // const walkableVariant = 2;
    // const obstruction = 8;
    // const obstructionVariant = 9;

    console.log("placement array", randomNumber());

    let map = [];
    for (let row = 0; row < 64; row++) {
      let newRow = [];
      for (let column = 0; column < 64; column++) {
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
            map[row][column] =
              // choose one walkableVariant from the range of walkable variants in its array
              walkableVariant[
                Math.floor(randomNumber() * walkableVariant.length)
              ];
          }
        }
      }
    }

    function replaceWithObstruction() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (
            walkableVariant.includes(map[row][column]) &&
            randomNumber() > 0.7
          ) {
            map[row][column] = obstruction;
          } else if (
            map[row][column] === 2 &&
            randomNumber() >= 0.55 &&
            randomNumber() < 0.99
          ) {
            map[row][column] =
              obstructionVariant[
                Math.floor(randomNumber() * obstructionVariant.length)
              ];
          }
        }
      }
    }

    return map;
  }
}
