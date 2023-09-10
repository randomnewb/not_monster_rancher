- GameObject Resources:

  - https://blog.ourcade.co/posts/2020/organize-phaser-3-code-game-object-factory-methods/
  - https://braelynnn.medium.com/extending-a-phaser-class-to-make-reusable-game-objects-93c11326787e
  - https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObjectFactory.html
  - https://phaser.io/phaser3/devlog/130

- Access helper functions from other scenes:

  - `this.scene.get('SceneName').helperFunction()`

- A functioning method to transition to another scene/remove a previous scene without having
  to remove a bunch of listeners, and other items that would cause errors:

```
const newGameScene = this.scene.get("NewGameMenuScene");
newGameScene.scene.start();
this.scene.bringToTop("NewGameMenuScene");
this.scene.stop("MainMenuScene");
this.time.delayedCall(1000, () => {
  this.scene.remove("MainMenuScene");
});
```
