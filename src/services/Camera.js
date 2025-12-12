import Vector from "../../lib/Vector.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../globals.js";

/**
 * A simple camera that follows the player in a top-down 2D game.
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
    // Get player's actual sprite size (accounting for scale)
    const playerScale = this.player.constructor.SCALE || 1;
    const spriteWidth = 32 * playerScale; // e.g., 64 if scale is 2
    const spriteHeight = 32 * playerScale; // e.g., 64 if scale is 2

    // Center of player sprite in world coordinates
    const playerCenterX = this.player.canvasPosition.x + spriteWidth / 2;
    const playerCenterY = this.player.canvasPosition.y + spriteHeight / 2;

    // Position camera so player center is at viewport center
    let targetX = playerCenterX - this.viewportWidth / 2;
    let targetY = playerCenterY - this.viewportHeight / 2;

    // Clamp to world boundaries
    const maxX = this.worldWidth - this.viewportWidth;
    const maxY = this.worldHeight - this.viewportHeight;

    if (maxX > 0) {
      targetX = Math.max(0, Math.min(maxX, targetX));
    } else {
      // World smaller than viewport - center the world
      targetX = maxX / 2;
    }

    if (maxY > 0) {
      targetY = Math.max(0, Math.min(maxY, targetY));
    } else {
      // World smaller than viewport - center the world
      targetY = maxY / 2;
    }

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
