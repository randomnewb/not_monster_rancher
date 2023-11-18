import data from "../data/data.js";
import seedrandom from "seedrandom";
import Jewel from "../classes/jewelClass.js";
import EntitySpawner from "../classes/entitySpawner.js";
import Frog from "../classes/frogClass.js";
import Bird from "../classes/birdClass.js";
import Bat from "../classes/batClass.js";

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

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 50) {
          const monsterTypes = [Frog, Bird, Bat];
          const monsterType = Phaser.Math.RND.pick(monsterTypes);

          // Create an EntitySpawner at this tile's position
          const entitySpawner = new EntitySpawner(
            scene,
            x * scene.tileWidth + scene.tileWidth / 2,
            y * scene.tileHeight + scene.tileHeight / 2,
            monsterType
          );

          // Add the EntitySpawner to the scene's entitySpawners array
          scene.entitySpawners.push(entitySpawner);
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
   * @param {integer} spawner - Integer representing a spawner frame value (50)
   *
   * @returns {array} - 2D array of integers representing a map
   */

  static placement_array(walkable = [], obstruction = [], spawner = []) {
    var randomNumber = seedrandom(data.gameSeed);
    randomNumber();

    let map = [];

    for (let row = 0; row < 64; row++) {
      let newRow = [];
      for (let column = 0; column < 64; column++) {
        if (randomNumber() > 0.5) {
          newRow.push(0);
        } else {
          newRow.push(walkable[0]);
        }
      }
      map.push(newRow);
    }

    replaceWithWalkable();
    replaceWithObstruction();
    replaceWithSpawner();

    function replaceWithWalkable() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (map[row][column] === walkable[0] && randomNumber() < 0.5) {
            map[row][column] =
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
              obstruction[Math.floor(randomNumber() * obstruction.length)];
          }
        }
      }
    }

    function replaceWithSpawner() {
      for (let row = 0; row < map.length; row++) {
        for (let column = 0; column < map[row].length; column++) {
          if (walkable.includes(map[row][column]) && randomNumber() > 0.999) {
            map[row][column] = 50;
          }
        }
      }
    }

    return map;
  }
}
