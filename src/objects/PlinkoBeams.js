import BodyType from "../enums/BodyType.js";
import { matter, context } from "../globals.js";
import GameMatter from "./GameMatter.js";
import Rectangle from "./Rectangle.js";

export default class PlinkoBeam extends Rectangle {
  static SPRITE_MEASUREMENTS = [{ x: 0, y: 0, width: 15, height: 128 }];
  static WIDTH = 13;
  static HEIGHT = 30;

  constructor(x, y) {
    super(x, y, PlinkoBeam.WIDTH, PlinkoBeam.HEIGHT, {
      label: BodyType.Beam,
      isStatic: true,
      restitution: 0.1,
      friction: 0.3,
    });
    const spriteSheet = "beam_sheet";

    this.sprites = GameMatter.generateSprites(
      PlinkoBeam.SPRITE_MEASUREMENTS,
      spriteSheet
    );

    const spriteWidth = PlinkoBeam.SPRITE_MEASUREMENTS[0].width;
    const spriteHeight = PlinkoBeam.SPRITE_MEASUREMENTS[0].height;

    this.renderOffset = {
      x: -spriteWidth / 2,
      y: -spriteHeight / 2,
    };

  }

  update(dt) {
    super.update(dt);
  }

  render() {
    if (!this.sprites || !this.sprites[this.currentFrame]) return;

    context.save();
    context.translate(this.body.position.x, this.body.position.y);
    context.rotate(this.body.angle);

    // Draw sprite
    this.sprites[this.currentFrame].render(
      this.renderOffset.x,
      this.renderOffset.y
    );

    // Draw hitbox overlay for debugging/visibility
    context.lineWidth = 2;
    context.strokeStyle = "red";
    context.strokeRect(
      this.renderOffset.x,
      this.renderOffset.y,
      this.width,
      this.height
    );

    context.restore();
    // context.restore();
    // super.render(() => {
    //   context.lineWidth = 4;
    //   context.strokeStyle = "blue";
    //   context.strokeRect(
    //     this.renderOffset.x,
    //     this.renderOffset.y,
    //     this.width,
    //     this.height
    //   );
    // });
  }
}

