export const Scenes = {
  Game: "GameScene",
  UI: "UIScene",
  NewGameMenu: "NewGameMenuScene",
  MainMenu: "MainMenuScene",
};

export const Assets = {
  FoliageTiles: "foliageTiles",
  Characters: "characters",
  Frog: "frog",
  Bird: "bird",
  Bat: "bat",
  EnemyAttack1: "enemy_attack1",
  Jewel: "jewel",
  Projectiles: "projectiles",
  Weapons: "weapons",
  Tools: "tools",
  Explosion: "explosion",
  Reactions: "reactions",
  AutoAttackIndicator: "auto_attack_indicator",
  Spawner: "spawner",
};

export const States = {
  Attack: "attack",
  Chase: "chase",
  Destroyed: "destroyed",
  Detect: "detect",
  Idle: "idle",
  Wander: "wander",
};

export const Events = {
  MonsterDestroyed: "monsterDestroyed",
  HealthChanged: "healthChanged",
  PlayerHealthChanged: "playerHealthChanged",
  PlayerMonstersDefeated: "playerMonstersDefeated",
  PlayerJewelCollected: "playerJewelCollected",
  PlayerLevelChanged: "playerLevelChanged",
  PlayerExpChanged: "playerExpChanged",
  Generate: "generate",
  MapArrayReady: "mapArrayReady",
  FireProjectile: "fireProjectile",
  ClosestEntityChanged: "closestEntityChanged",
};

export const Animations = {
  FrogMove: "frog_move",
  FrogIdle: "frog_idle",
  BirdMove: "bird_move",
  BirdIdle: "bird_idle",
  BatMove: "bat_move",
  BatIdle: "bat_idle",
  Explosion: "explosion",
};

export const AnimationKeys = [];

export const Colors = {
  Red: 0xbe4a2f,
  Orange: 0xd77643,
  PaleYellow: 0xead4aa,
  LightBrown: 0xe4a672,
  Brown: 0xb86f50,
  DarkRed: 0x733e39,
  DarkBrown: 0x3e2731,
  Crimson: 0xa22633,
  CardinalRed: 0xe43b44,
  Pumpkin: 0xf77622,
  Gold: 0xfeae34,
  Yellow: 0xfee761,
  LightGreen: 0x63c74d,
  DarkGreen: 0x3e8948,
  ForestGreen: 0x265c42,
  Teal: 0x193c3e,
  DarkBlue: 0x124e89,
  SkyBlue: 0x0099db,
  LightBlue: 0x2ce8f5,
  White: 0xffffff,
  LightGrey: 0xc0cbdc,
  Grey: 0x8b9bb4,
  DarkGrey: 0x5a6988,
  Navy: 0x3a4466,
  RoyalBlue: 0x262b44,
  Black: 0x181425,
  Pink: 0xff0044,
  Purple: 0x68386c,
  Magenta: 0xb55088,
  LightRed: 0xf6757a,
  Beige: 0xe8b796,
  Tan: 0xc28569,
};

export const grassTileColors = [
  Colors.Brown,
  Colors.DarkRed,
  Colors.Gold,
  Colors.LightGreen,
  Colors.DarkGreen,
  Colors.ForestGreen,
];

export const treeTileColors = [
  Colors.DarkRed,
  Colors.DarkBrown,
  Colors.LightGreen,
  Colors.DarkGreen,
  Colors.ForestGreen,
];

export const rockTileColors = [
  Colors.LightGrey,
  Colors.Grey,
  Colors.DarkGrey,
  Colors.Beige,
  Colors.Tan,
  Colors.Brown,
];

export const stoneTileColors = [
  Colors.LightGrey,
  Colors.Grey,
  Colors.DarkGrey,
  Colors.Navy,
  Colors.RoyalBlue,
];

export const spawnerTileColors = [
  Colors.Pink,
  Colors.Purple,
  Colors.Magenta,
  Colors.LightRed,
];

export const playerColors = [
  Colors.Pumpkin,
  Colors.Yellow,
  Colors.LightGreen,
  Colors.SkyBlue,
  Colors.Purple,
  Colors.CardinalRed,
];

export const walkableTiles = [0, 1, 2, 3, 4, 5, 6, 7];
export const obstructionTiles = [
  8, 9, 10, 11, 12, 13, 24, 25, 26, 27, 28, 29, 30, 31,
];
export const spawnerTiles = [50];
