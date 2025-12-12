import BodyType from "../enums/BodyType.js";
import Circle from "./Circle.js";

import { matter, context } from "../globals.js";
import GameMatter from "./GameMatter.js";

export default class PlinkoPeg extends Circle {
  static SPRITE_MEASUREMENTS = [{ x: 32, y: 0, width: 32, height: 32 }];
  static RADIUS = 10;

  /**
   * this is peg
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    super(x, y, PlinkoPeg.RADIUS, {
      label: BodyType.Pegs,
      isStatic: true,
      restitution: 0.9,
      friction: 0.05,
    });
    const spriteSheet = "crystal_ball_sheet";

    this.sprites = GameMatter.generateSprites(
      PlinkoPeg.SPRITE_MEASUREMENTS,
      spriteSheet
    );

    // Center the sprite on the collision circle
    const spriteWidth = PlinkoPeg.SPRITE_MEASUREMENTS[0].width;
    const spriteHeight = PlinkoPeg.SPRITE_MEASUREMENTS[0].height;
    this.renderOffset = {
      x: -spriteWidth / 2,
      y: -spriteHeight / 2,
    };

    this.currentFrame = 0;
    this.flashTimer = 0;
    this.isFlashing = false;
  }

  update(dt) {
    super.update(dt);

    // Handle flash effect
    if (this.isFlashing) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.isFlashing = false;
        this.currentFrame = 0;
      }
    }
  }

  // render() {
  //   // Render full-size pig sprite
  //   if (!this.sprites || !this.sprites[this.currentFrame]) return;

  //   context.save();
  //   context.translate(this.body.position.x, this.body.position.y);
  //   context.rotate(this.body.angle);

  //   // Render full-size sprite centered on collision circle
  //   this.sprites[this.currentFrame].render(
  //     this.renderOffset.x,
  //     this.renderOffset.y
  //   );

  //   context.restore();
  // }
}
