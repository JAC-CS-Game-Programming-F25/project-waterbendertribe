import Colour from "../enums/Colour.js";
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
  world,
} from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import EnemyFactory from "./EnemyFactory.js";
import Ball from "../objects/Ball.js";
import UserInterface from "./UserInterface.js";

export default class Map {
  constructor(mapDefinition, playState = null) {
    this.width = mapDefinition.width;
    this.height = mapDefinition.height;
    this.playState = playState;

    const sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Tiles),
      Tile.SIZE,
      Tile.SIZE
    );

    this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
    this.collisionLayer = new Layer(
      mapDefinition.layers[Layer.COLLISION],
      sprites
    );
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);

    // Create player
    this.player = new Player({ position: new Vector(20, 20) }, this);
    this.userInterface = new UserInterface(this.player);

    // Create camera
    this.useCamera = this.width;
    this.camera = new Camera(
      this.player,
      this.width * Tile.SIZE,
      this.height * Tile.SIZE
    );

    // Game objects
    this.balls = [];
    this.spawnRandomBalls(5);

    // Create enemies using factory
    this.enemies = this.createEnemies();
  }

  /**
   * Create random enemies at spawn points using EnemyFactory
   * eventually will be place in a circle formate at the start of the game
   */
  createEnemies() {
    const enemies = [];

    const spawnPositions = [
      new Vector(10, 10),
      new Vector(15, 5),
      new Vector(5, 15),
      new Vector(25, 25),
      new Vector(20, 15),
    ];

    spawnPositions.forEach((position) => {
      const type = EnemyFactory.getRandomCatType();
      const enemy = EnemyFactory.createInstance(
        type,
        { position: position },
        this,
        this.player
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
      const randomX = Math.random() * (this.width * Tile.SIZE - 100) + 50;
      const randomY = Math.random() * (this.height * Tile.SIZE - 100) + 50;
      this.balls.push(new Ball(new Vector(randomX, randomY), this));
    }
  }

  switchMap(mapName) {
    if (this.playState && this.playState.switchMap) {
      this.playState.switchMap(mapName);
    }
  }

  update(dt) {
    matter.Engine.update(engine, dt * 1000);

    this.player.update(dt);
    this.camera.update(dt);

    // Zelda collsiion
    this.updateCollision(dt);
    this.updateEntities(dt);

    this.cleanUpEntities();
  }

  /**
   * Collision detection frrom Zelda
   */
  updateCollision(dt) {
    this.enemies.forEach((enemy) => {
      enemy.update(dt);

      if (enemy.isDead) return;

      if (
        this.player.isClawActive() &&
        this.player.didCollideWithEntity(enemy.hitbox)
      ) {
        this.handleDamage(this.player, enemy);
      }

      if (
        enemy.isClawActive() &&
        enemy.didCollideWithEntity(this.player.bodyHitbox)
      ) {
        this.handleDamage(enemy, this.player);
      }
    });
  }

  handleDamage(attacker, receiver) {
    attacker.deactivateClawHitbox();

    const baseDamage = (attacker.strength ?? 0) + 1;
    const defenseReduction = receiver.defense ?? 0;
    const finalDamage = Math.max(baseDamage - defenseReduction, 1); // this will always be min 0.5

    receiver.receiveDamage(finalDamage);
  }

  /**
   * Update all game entities
   */
  updateEntities(dt) {
    // Update balls
    this.balls.forEach((ball) => ball.update(dt));

    this.balls.forEach((ball) => {
      if (ball.isConsumable && !ball.wasConsumed && !ball.cleanUp) {
        if (
          ball.hitbox &&
          this.player.bodyHitbox &&
          ball.hitbox.didCollide(this.player.bodyHitbox)
        ) {
          ball.onConsume(this.player);
        }
      }
    });
  }

  /**
   * Clean up dead entities and consumed items (Zelda-style)
   */
  cleanUpEntities() {
    // Remove dead enemies
    this.enemies = this.enemies.filter((enemy) => !enemy.isDead);

    // Remove consumed balls
    this.balls = this.balls.filter((ball) => !ball.cleanUp);
  }

  render() {
    if (this.useCamera) {
      this.camera.applyTransform(context);
    }

    // Render bottom layer
    this.bottomLayer.render();

    this.collisionLayer.render(); // Collision layer
    this.enemies.forEach((enemy) => {
      enemy.render();
    });

    // Render balls
    this.balls.forEach((ball) => ball.render());

    // Render player
    this.player.render();

    // Render top layer (trees, etc. that appear above player)
    this.topLayer.render();

    if (this.squishyCat) {
      this.squishyCat.render(context);
    }

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
