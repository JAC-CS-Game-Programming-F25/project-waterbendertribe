import Vector from "../../lib/Vector.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";
import Player from "../entities/player/Player.js";

/**
 * A simple camera that follows the player in a top down 2D game.
 */
export default class Camera {
  //camera viewport size how much of the world you see
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
   * Upates the camera's position to follow the player.
   *
   * @param {number} dt - Delta time, the time passed since the last frame.
   */
  update(dt) {
    this.scale = Math.min(
      CANVAS_WIDTH / this.viewportWidth,
      CANVAS_HEIGHT / this.viewportHeight
    );

    const playerScale = Player.SCALE || 1;
    const spriteSize = 32 * playerScale;

    const playerCenterX = this.player.position.x + spriteSize / 2;
    const playerCenterY = this.player.position.y + spriteSize / 2;

    //Visible area in WORLD units
    const viewWidth = CANVAS_WIDTH / this.scale;
    const viewHeight = CANVAS_HEIGHT / this.scale;

    // center camera on player
    let targetX = playerCenterX - viewWidth / 2;
    let targetY = playerCenterY - viewHeight / 2;

    // clamp so it never shows outside the map
    const maxX = this.worldWidth - viewWidth;
    const maxY = this.worldHeight - viewHeight;

    targetX = Math.max(0, Math.min(maxX, targetX));
    targetY = Math.max(0, Math.min(maxY, targetY));

    this.position.x = Math.round(targetX);
    this.position.y = Math.round(targetY);
  }

  applyTransform(context) {
    context.save();
    context.scale(this.scale, this.scale);
    context.translate(-this.position.x, -this.position.y);
  }

  resetTransform(context) {
    context.restore();
  }
}
