import { Assets } from "./constants.js";

export default function preloadAssets() {
  this.load.spritesheet(Assets.FoliageTiles, "./assets/foliage.png", {
    frameWidth: this.tileWidth,
    frameHeight: this.tileHeight,
  });

  this.load.spritesheet(Assets.Characters, "./assets/characters.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.spritesheet(Assets.Frog, "./assets/frog.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.spritesheet(Assets.Bird, "./assets/bird1.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.spritesheet(Assets.EnemyAttack1, "./assets/enemy_attack1.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.image(Assets.Jewel, "./assets/jewel.png");

  this.load.spritesheet(Assets.Projectiles, "./assets/projectiles.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.spritesheet(Assets.Weapons, "./assets/weaponSheet.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.spritesheet(Assets.Explosion, "./assets/explosion.png", {
    frameWidth: 16,
    frameHeight: 16,
  });

  this.load.spritesheet(Assets.Reactions, "./assets/reactions.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
}
