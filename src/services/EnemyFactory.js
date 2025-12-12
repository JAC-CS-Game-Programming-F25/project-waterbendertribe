import Enemy from "../entities/Enemy.js";
import ImageName from "../enums/ImageName.js";
import Sprite from "../../lib/Sprite.js";
import CatType from "../enums/CatType.js";
import { images } from "../globals.js";

/**
 * Encapsulates all definitions for instantiating new enemies.
 */
export default class EnemyFactory {
  static ENEMY_TYPES = [
    CatType.BlackCat,
    CatType.BlueCat,
    CatType.HairlessCat,
    CatType.OrangeCat,
    CatType.PurpleCat,
    CatType.RedCat,
  ];

  /**
   * @param {string} type A string using the CatType enum.
   * @param {object} entityDefinition Starting position and properties
   * @param {Map} map The game map
   * @param {Player} player The player reference
   * @returns An instance of an enemy specified by CatType.
   */
  static createInstance(type, entityDefinition, map, player) {
    const sprites = this.getSpriteSheets(type);

    return new Enemy(
      entityDefinition,
      map,
      player,
      sprites.walking,
      sprites.running,
      type
    );
  }

  /**
   * Get a random cat type from the available types
   */
  static getRandomCatType() {
    const randomIndex = Math.floor(Math.random() * this.ENEMY_TYPES.length);
    return this.ENEMY_TYPES[randomIndex];
  }

  /**
   * Get sprite sheets for a specific cat type
   */
  static getSpriteSheets(type) {
    const spriteMapping = {
      [CatType.BlackCat]: {
        walking: ImageName.BlackCatWalking,
        running: ImageName.BlackCatRunning,
      },
      [CatType.BlueCat]: {
        walking: ImageName.BlueCatWalking,
        running: ImageName.BlueCatRunning,
      },
      [CatType.HairlessCat]: {
        walking: ImageName.HairlessCatWalking,
        running: ImageName.HairlessCatRunning,
      },
      [CatType.OrangeCat]: {
        walking: ImageName.OrangeCatWalking,
        running: ImageName.OrangeCatRunning,
      },
      [CatType.PurpleCat]: {
        walking: ImageName.PurpleCatWalking,
        running: ImageName.PurpleCatRunning,
      },
      [CatType.RedCat]: {
        walking: ImageName.RedCatWalking,
        running: ImageName.RedCatRunning,
      },
    };

    const imageNames = spriteMapping[type];

    // ✅ DETAILED DEBUG LOGGING
    console.log(`🔍 Loading sprites for: ${type}`);
    console.log(`   Walking image name: ${imageNames.walking}`);
    console.log(`   Running image name: ${imageNames.running}`);

    const walkingImage = images.get(imageNames.walking);
    const runningImage = images.get(imageNames.running);

    console.log(`   Walking image loaded:`, walkingImage ? "✅ YES" : "❌ NO");
    console.log(`   Running image loaded:`, runningImage ? "✅ YES" : "❌ NO");

    if (!walkingImage) {
      console.error(`❌ MISSING IMAGE: ${imageNames.walking}`);
      console.error(`Available images:`, Array.from(images.keys()));
      throw new Error(`Missing walking image: ${imageNames.walking}`);
    }

    if (!runningImage) {
      console.error(`❌ MISSING IMAGE: ${imageNames.running}`);
      console.error(`Available images:`, Array.from(images.keys()));
      throw new Error(`Missing running image: ${imageNames.running}`);
    }

    return {
      walking: Sprite.generateSpritesFromSpriteSheet(
        walkingImage,
        Enemy.WIDTH,
        Enemy.HEIGHT
      ),
      running: Sprite.generateSpritesFromSpriteSheet(
        runningImage,
        Enemy.WIDTH,
        Enemy.HEIGHT
      ),
    };
  }
}
