import Colour from "../enums/Colour.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  context,
  DEBUG,
  images,
} from "../globals.js";
import Camera from "./Camera.js";

export default class Map {
  /**
   * The collection of layers, sprites,
   * and characters that comprises the world.
   *
   * @param {object} mapDefinition JSON from Tiled map editor.
   */
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

    this.player = new Player(50, 50, 32, 32, this);
    this.camera = new Camera(
      this.player,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      this.width * Tile.SIZE,
      this.height * Tile.SIZE
    );
  }

  update(dt) {
    this.player.update(dt);
    //this.enemy.update(dt); update enemies
    this.camera.update(dt);
  }

  render(context) {
    this.camera.applyTransform(context);
    this.bottomLayer.render();
    this.collisionLayer.render();
    this.player.render(context);
    //this.enemy.render();
    this.topLayer.render();

    this.camera.resetTransform(context);

    if (DEBUG) {
      Map.renderGrid();
    }
  }

  /**
   * Draws a grid of squares on the screen to help with debugging.
   */
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
