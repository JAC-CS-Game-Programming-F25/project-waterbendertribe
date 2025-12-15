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
  engine,
  matter,
} from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import EnemyFactory from "./EnemyFactory.js";
import Ball from "../objects/Ball.js";
import UserInterface from "./UserInterface.js";

/**
 * Map: creates tile layers, camera, entities, collisions, and rendering for the main world.
 *
 * Loads and renders layered tile map (`bottom`, `bottomTwo`, `collision`, `top`).
 * Manages player, enemies, collectibles (balls), UI, and camera following.
 * Checks win/lose
 */
export default class Map {
  constructor(mapDefinition, playState = null) {
    this.mapDefinition = mapDefinition;
    this.width = mapDefinition.width;
    this.height = mapDefinition.height;
    this.playState = playState;
    this.wins = 0;

    const sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Tiles),
      Tile.SIZE,
      Tile.SIZE
    );

    this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
    this.bottomLayerTwo = new Layer(
      mapDefinition.layers[Layer.BOTTOM_TWO],
      sprites
    );
    this.collisionLayer = new Layer(
      mapDefinition.layers[Layer.COLLISION],
      sprites
    );
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);

    // Create player
    this.playerOffsetX = 26.96 * Tile.SIZE;
    this.playerOffsetY = 19.5 * Tile.SIZE;
    this.player = new Player(
      {
        position: new Vector(this.playerOffsetX, this.playerOffsetY),
        health: 6,
        attack: 1,
        defense: 0,
        speed: 110,
      },
      this
    );

    this.userInterface = new UserInterface(this.player);

    // Create camera
    this.useCamera = this.width;
    this.camera = new Camera(
      this.player,
      this.width * Tile.SIZE,
      this.height * Tile.SIZE
    );

    this.balls = [];
    this.spawnRandomBalls(5);
    this.enemies = this.createEnemies();
  }

  /**
   * Create random enemies at spawn points using EnemyFactory
   * is placed on a circle formate at the start of the game
   */
  createEnemies() {
    const enemies = [];
    const bottomLayerTwoData = this.mapDefinition.layers[Layer.BOTTOM_TWO].data;

    bottomLayerTwoData.forEach((tileId, index) => {
      if (!tileId) return;

      const tileX = index % this.width;
      const tileY = Math.floor(index / this.width);

      // player tile (same logic you used before)
      const playerTileX = 27;
      const playerTileY = 19; // because Math.floor(19.5) = 19

      if (tileX === playerTileX && tileY === playerTileY) return;

      // tile-space offsets, converted to pixels
      const worldX = (tileX - 0.55) * Tile.SIZE + Tile.SIZE / 2;
      const worldY = (tileY - 0.1) * Tile.SIZE;

      const type = EnemyFactory.getRandomCatType();
      const enemy = EnemyFactory.createInstance(
        type,
        {
          position: new Vector(worldX, worldY),
          health: 6,
          attack: 1,
          defense: 0,
          speed: 100,
        },
        this
      );

      enemies.push(enemy);
    });

    return enemies;
  }

  /**
   * Spawn random balls on the map
   */
  spawnRandomBalls(count) {
    for (let i = 0; i < count; i++) {
      const x =
        Math.random() * (this.width * Tile.SIZE - Tile.SIZE) + Tile.SIZE / 2;
      const y =
        Math.random() * (this.height * Tile.SIZE - Tile.SIZE) + Tile.SIZE;

      this.balls.push(new Ball(new Vector(x, y), this));
    }
  }

  /**
   * Spawn random balls on the map
   */
  spawnRandomBalls(count) {
    for (let i = 0; i < count; i++) {
      const randomX = Math.random() * (this.width * Tile.SIZE - 100) + 50;
      const randomY = Math.random() * (this.height * Tile.SIZE - 100) + 50;
      this.balls.push(new Ball(new Vector(randomX, randomY), this));
    }
  }

  switchMap(mapName) {
    if (this.playState?.switchMapWithTransition) {
      this.playState.switchMapWithTransition(mapName);
    } else if (this.playState?.switchMap) {
      this.playState.switchMap(mapName);
    }
  }

  update(dt) {
    matter.Engine.update(engine, dt * 1000);

    this.player.update(dt);
    this.camera.update(dt);

    this.updatePlayerCollision(dt);
    this.updateBallCollision(dt);

    this.cleanUpEntities();
  }

  /**
   * Collision for players
   */
  updatePlayerCollision(dt) {
    this.enemies.forEach((enemy) => {
      enemy.update(dt);

      if (enemy.isDead) return;

      // Player attacks enemy
      if (
        this.player.isClawActive() &&
        this.player.didCollideWithEntity(enemy.hitbox)
      ) {
        this.handleDamage(this.player, enemy);
      }

      // Enemy attacks player
      if (
        enemy.isClawActive() &&
        enemy.didCollideWithEntity(this.player.bodyHitbox)
      ) {
        this.handleDamage(enemy, this.player);
      }

      // Enemy vs Enemy
      this.enemies.forEach((otherEnemy) => {
        if (otherEnemy === enemy || otherEnemy.isDead) return;

        if (
          enemy.isClawActive() &&
          enemy.didCollideWithEntity(otherEnemy.hitbox)
        ) {
          this.handleDamage(enemy, otherEnemy);
        }
      });
    });
  }

  /**
   * Apply damage from atacker to receiver with defense reduction.
   *
   *damage formula: max((attacker.strength + 1) - receiver.defene, 1)
   */
  handleDamage(attacker, receiver) {
    attacker.deactivateClawHitbox();

    const baseDamage = (attacker.strength ?? 0) + 1;
    const defenseReduction = receiver.defense ?? 0;
    const finalDamage = Math.max(baseDamage - defenseReduction, 1); // this will always be min 0.5

    receiver.receiveDamage(finalDamage);
  }

  /**
   * Update all ball collision
   */
  updateBallCollision(dt) {
    this.balls.forEach((ball) => {
      ball.update(dt);

      if (!ball.isConsumable || ball.wasConsumed || ball.cleanUp) return;

      // Ball vs Player
      if (
        ball.hitbox &&
        this.player.bodyHitbox &&
        ball.hitbox.didCollide(this.player.bodyHitbox)
      ) {
        ball.onConsume(this.player);
      }

      // Ball vs Enemies
      this.enemies.forEach((enemy) => {
        if (enemy.isDead) return;

        if (
          ball.hitbox &&
          enemy.hitbox &&
          ball.hitbox.didCollide(enemy.hitbox)
        ) {
          ball.onConsume(enemy);
        }
      });
    });
  }

  didWin() {
    return this.enemies.length === 0;
  }

  didLose() {
    return this.player?.isDead && this.enemies.length > 0;
  }

  /**
   * Clean up dead entities and consumed items
   */
  cleanUpEntities() {
    // Remove dead enemies
    this.enemies = this.enemies.filter((enemy) => !enemy.isDead);

    // Remove consumed balls
    this.balls = this.balls.filter((ball) => !ball.cleanUp);
  }

  /**
   * Render the map layers, entities, UI, and optional debug grid.
   */
  render() {
    if (this.useCamera) {
      this.camera.applyTransform(context);
    }

    this.bottomLayer.render();
    this.bottomLayerTwo.render();

    this.collisionLayer.render();
    this.enemies.forEach((enemy) => {
      enemy.render();
    });

    this.balls.forEach((ball) => ball.render());
    this.player.render();

    this.topLayer.render();

    if (DEBUG) {
      Map.renderGrid();
    }

    if (this.useCamera) {
      this.camera.resetTransform(context);
    }

    this.userInterface.render();
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
