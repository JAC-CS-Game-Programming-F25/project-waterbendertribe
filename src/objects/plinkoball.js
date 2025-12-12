import { matter } from "../globals.js";
import BodyType from "../enums/BodyType.js";
import Circle from "./Circle.js";
import GameMatter from "./GameMatter.js";

export default class PlinkoBall extends Circle {
  static SPRITE_MEASUREMENTS = [{ x: 0, y: 0, width: 32, height: 32 }];
  static RADIUS = 15;

  /**
   * A ball that drops through the Plinko board.
   * Based on the Bird class but optimized for Plinko gameplay.
   *
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super(x, y, PlinkoBall.RADIUS, {
      label: BodyType.CatBall,
      density: 0.1,
      restitution: 0.8,
      friction: 0.1,
      collisionFilter: {
        group: -1,
      },
    });

    const spriteSheet = "plinko_ball";

    this.sprites = GameMatter.generateSprites(
      PlinkoBall.SPRITE_MEASUREMENTS,
      spriteSheet
    );
    this.renderOffset = { x: -17, y: -20 };

    this.hasScored = false;

    // Add slight random initial velocity
    const randomVelocity = (Math.random() - 0.5) * 2;
    matter.Body.setVelocity(this.body, { x: randomVelocity, y: 0 });
  }

  update(dt) {
    // Check if ball fell off screen
    if (this.didFallOffBottom()) {
      this.shouldCleanUp = true;
    }

    super.update(dt);
  }

  /**
   * Check if ball fell past the bottom
   */
  didFallOffBottom() {
    return this.body.position.y > 1000;
  }
}
