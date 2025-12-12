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
import Ball from "../objects/Ball.js";

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
    this.collisionLayer = new Layer(mapDefinition.layers[Layer.COLLISION], sprites);
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);
    this.player = new Player({ position: new Vector(20, 20) }, this);

    this.useCamera = this.width;

    this.camera = new Camera(
      this.player,
      this.width * Tile.SIZE,
      this.height * Tile.SIZE
    );

    this.balls = [];
    this.spawnRandomBalls(5);
  }

  /**
   * Spawn random balls on the map
   * @param {number} count - Number of balls to spawn
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
    if (this.useCamera) {
      this.camera.update(dt);
    }
    this.updateEntities(dt);
    this.cleanUpEntities();
  }

  updateEntities(dt) {
    this.balls.forEach((ball) => ball.update(dt));

    this.balls.forEach((ball) => {
      if (ball.isConsumable && !ball.wasConsumed && !ball.cleanUp) {
        if (ball.hitbox.didCollide(this.player.hitbox)) {
          ball.onConsume(this.player);
        }
      }
    });
  }

  cleanUpEntities() {
    this.balls = this.balls.filter((ball) => !ball.cleanUp);
  }

  render() {
    if (this.useCamera) {
      this.camera.applyTransform(context);
    }

    this.bottomLayer.render();
    this.collisionLayer.render();
    this.balls.forEach((ball) => ball.render());
    this.player.render();
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
  }

  static renderGrid() {
    context.save();
    context.strokeStyle = Colour.White;

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
