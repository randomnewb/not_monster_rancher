import State from "./state.js";

export default class DetectState extends State {
  constructor() {
    super();
  }

  enter(scene, npc) {
    console.log(`${npc.constructor.name} entered the detect state`);
    npc.setVelocity(0);
    npc.isMoving = false;

    npc.detectTime = Phaser.Math.Between(3, 5) * 60; // Detect for 1 to 5 seconds (60 frames per second)
    npc.detectCounter = 0; // Initialize counter

    // Create the exclamation point sprite above the npc's head
    let exclamationSprite = scene.add.sprite(
      npc.x,
      npc.y - npc.height,
      "reactions",
      0
    );

    exclamationSprite.setTint(0xff0000);

    // Make the sprite fade away after 2 seconds
    scene.tweens.add({
      targets: exclamationSprite,
      alpha: 0,
      duration: 1000,
      onComplete: function () {
        exclamationSprite.destroy();
      },
    });
  }

  execute(scene, npc) {
    // Increment the counter each frame
    npc.detectCounter++;

    // Calculate the distance between the npc and the player
    const distance = Phaser.Math.Distance.Between(
      npc.x,
      npc.y,
      scene.player.x,
      scene.player.y
    );

    // Check if the player is more than 6 tiles away
    if (distance > 80) {
      npc.stateMachine.transition("idle");
      npc.detectCounter = 0; // Reset counter

      // Create the question mark sprite above the npc's head
      let questionSprite = scene.add.sprite(
        npc.x,
        npc.y - npc.height,
        "reactions",
        2
      );

      // Make the sprite fade away after 1 second
      scene.tweens.add({
        targets: questionSprite,
        alpha: 0,
        duration: 1000,
        onComplete: function () {
          questionSprite.destroy();
        },
      });
    }
    // Check if the counter has exceeded the detect time
    else if (npc.detectCounter > npc.detectTime) {
      npc.stateMachine.transition("chase");
      npc.detectCounter = 0; // Reset counter
    }
  }

  exit(scene, npc) {
    if (npc.detectCounter) {
      // If there's an detect event scheduled
      npc.detectCounter = 0; // Reset counter
    }
  }
}
