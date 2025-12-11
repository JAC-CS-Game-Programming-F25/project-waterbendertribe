import Vector from "../../lib/Vector.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";

/**
 *
 */
export default class Camera {
  // Camera viewport size (how much of the world you see)
  static VIEWPORT_WIDTH = 640;
  static VIEWPORT_HEIGHT = 640;

  constructor(player, worldWidth, worldHeight) {
    this.player = player;
    this.viewportWidth = Camera.VIEWPORT_WIDTH;
    this.viewportHeight = Camera.VIEWPORT_HEIGHT;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.position = new Vector(0, 0);

    this.scale = Math.min(
      CANVAS_WIDTH / this.viewportWidth,
      CANVAS_HEIGHT / this.viewportHeight
    );
  }

  /**
   * Updates the camera's position to follow the player.
   *
   * @param {number} dt - Delta time, the time passed since the last frame.
   */
  update(dt) {
    // This grabs player position relative to the canvas
    this.position.x = this.player.canvasPosition.x - this.viewportWidth / 2;
    this.position.y = this.player.canvasPosition.y - this.viewportHeight / 2;

    this.position.x = Math.max(
      0,
      Math.min(this.worldWidth - this.viewportWidth, this.position.x)
    );
    this.position.y = Math.max(
      0,
      Math.min(this.worldHeight - this.viewportHeight, this.position.y)
    );

    this.position.x = Math.round(this.position.x);
    this.position.y = Math.round(this.position.y);
  }

  applyTransform(context) {
    context.save();

    // Scale to fit viewport to canvas
    context.scale(this.scale, this.scale);

    context.translate(-this.position.x, -this.position.y);
  }

  resetTransform(context) {
    context.restore();
  }
}
