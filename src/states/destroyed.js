import State from "./state.js";

export default class DestroyedState extends State {
  enter(scene, npc) {
    // Destroyed state enter logic
    // console.log(`${npc.constructor.name} entered the destroyed state`);
    // Call the parent class's destroy method
  }

  execute(scene, npc) {
    // Destroyed state execute logic
  }

  exit(scene, npc) {
    // Destroyed state exit logic
  }
}
