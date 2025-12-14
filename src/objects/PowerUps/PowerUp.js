import { matter, world, context, DEBUG } from "../../globals.js";
import BodyType from "../../enums/BodyType.js";
import Rectangle from "../Rectangle.js";

/**
 * Base class for all Plinko power-ups.
 *
 * It provides a rectangular Matter.js body labeled as `PowerUp`
 * On consume, removes its physics body and triggers return to map via plinkoState.
 */
export default class PowerUp extends Rectangle {
  static WIDTH = 35;
  static HEIGHT = 30;

  constructor(x, y, plinkoState = null) {
    super(x, y, PowerUp.WIDTH, PowerUp.HEIGHT, {
      label: BodyType.PowerUp,
      isStatic: true,
      restitution: 0.1,
      friction: 0.3,
    });

    this.plinkoState = plinkoState;
    this.isConsumable = true;
    this.wasConsumed = false;
    this.body.entity = this;

    this.renderOffset = {
      x: -PowerUp.WIDTH / 2,
      y: -PowerUp.HEIGHT / 2,
    };
  }

  update(dt) {
    super.update(dt);
  }

  onConsume() {
    if (this.wasConsumed) return;

    this.wasConsumed = true;
    this.shouldCleanUp = true;

    if (this.body) {
      matter.Composite.remove(world, this.body);
    }

    //return to main map trough PlinkoState
    if (
      this.plinkoState &&
      typeof this.plinkoState.returnToMainMap === "function"
    ) {
      setTimeout(() => {
        this.plinkoState.returnToMainMap();
      }, 100);
    }
  }

  render() {
    if (this.wasConsumed) return;

    context.save();
    context.translate(this.body.position.x, this.body.position.y);
    context.rotate(this.body.angle);

    this.sprites[this.currentFrame].render(
      this.renderOffset.x,
      this.renderOffset.y
    );

    if (DEBUG) {
      context.lineWidth = 2;
      context.strokeStyle = "red";
      context.strokeRect(
        this.renderOffset.x,
        this.renderOffset.y,
        PowerUp.WIDTH,
        PowerUp.HEIGHT
      );
    }

    context.restore();
  }
}
