import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import Camera from "./Camera.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  context,
  DEBUG,
  images,
} from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import EnemyFactory from "./EnemyFactory.js";

export default class Map {
  constructor(mapDefinition) {
    const sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Tiles),
      Tile.SIZE,
      Tile.SIZE
    );

    this.width = mapDefinition.width;
    this.height = mapDefinition.height;

    this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
    this.collisionLayer = new Layer(
      mapDefinition.layers[Layer.COLLISION],
      sprites
    );
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);

    // Create player
    this.player = new Player({ position: new Vector(20, 20) }, this);

    // Create camera
    this.camera = new Camera(
      this.player,
      this.width * Tile.SIZE,
      this.height * Tile.SIZE
    );

    // Create enemies using factory
    this.enemies = this.createEnemies();
  }

  /**
   * Create random enemies at spawn points using EnemyFactory
   */
  createEnemies() {
    const enemies = [];

    // Define enemy spawn positions (tile coordinates)
    const spawnPositions = [
      new Vector(10, 10),
      new Vector(15, 5),
      new Vector(5, 15),
      new Vector(25, 25),
      new Vector(20, 15),
    ];

    // Create a RANDOM enemy at each spawn point
    spawnPositions.forEach((position) => {
      const type = EnemyFactory.getRandomCatType();
      const enemy = EnemyFactory.createInstance(
        type,
        { position: position },
        this,
        this.player
      );
      enemies.push(enemy);

      console.log(
        `Spawned ${enemy.type} enemy at (${position.x}, ${position.y})`
      );
    });

    return enemies;
  }

  update(dt) {
    this.player.update(dt);
    this.camera.update(dt);

    // Update all enemies
    this.enemies.forEach((enemy) => {
      enemy.update(dt);

      // Check if player's claw hit this enemy
      if (
        this.player.isClawActive() &&
        this.player.clawHitbox.didCollide(enemy.hitbox)
      ) {
        this.handleEnemyHit(enemy);
      }
    });
  }

  render() {
    this.camera.applyTransform(context);

    // Render bottom layer
    this.bottomLayer.render();

    this.collisionLayer.render();

    // Render all enemies (before player so player appears on top if overlapping)
    this.enemies.forEach((enemy) => {
      enemy.render();
    });

    // Render player
    this.player.render();

    // Render top layer (trees, etc. that appear above player)
    this.topLayer.render();

    if (DEBUG) {
      Map.renderGrid();
    }

    this.camera.resetTransform(context);
  }

  /**
   * Handle when player hits an enemy with claw attack
   */
  handleEnemyHit(enemy) {
    console.log(`${enemy.type} enemy hit!`);

    // Deactivate claw so it only hits once per attack
    this.player.deactivateClawHitbox();

    // TODO: Add enemy damage/death logic here
    // For now, just remove the enemy
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  static renderGrid() {
    context.save();
    for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
      context.beginPath();
      context.moveTo(0, y * Tile.SIZE);
      context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
      context.closePath();
      context.stroke();

      for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
        context.beginPath();
        context.moveTo(x * Tile.SIZE, 0);
        context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
        context.closePath();
        context.stroke();
      }
    }
    context.restore();
  }
}
