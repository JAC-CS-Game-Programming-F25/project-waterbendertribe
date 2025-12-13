import Vector from "../../../lib/Vector.js";
import GameObject from "../GameObject.js";
import Hitbox from "../../../lib/Hitbox.js";
import Sprite from "../../../lib/Sprite.js";
import { matter, world, images, context, DEBUG } from "../../globals.js";
import BodyType from "../../enums/BodyType.js";
import Rectangle from "../Rectangle.js";
import GameMatter from "../GameMatter.js";

export default class PowerUp extends Rectangle {
  	static WIDTH = 35;
  	static HEIGHT = 30;

  constructor(x, y) {
    super(x, y, PowerUp.WIDTH, PowerUp.HEIGHT, {
      label: BodyType.PowerUp,
      isStatic: true,
      restitution: 0.1,
      friction: 0.3,
    });

    // Keep a back-reference on the body for collision callbacks
    this.body.entity = this;
    this.body.gameObject = this;


	this.isConsumable = true;
	this.wasConsumed = false;

    // Center sprite and hitbox around body origin
    this.renderOffset = {
      x: -PowerUp.WIDTH / 2,
      y: -PowerUp.HEIGHT / 2,
    };

  }

  update(dt) {
    super.update(dt);
  }

   onConsume() {
    this.wasConsumed = true;
    this.shouldCleanUp = true;

    if (this.body) {
      matter.Composite.remove(world, this.body);
    }

    // Return to main map when collected in plinko
    if (this.playState && typeof this.playState.switchMap === "function") {
      this.playState.switchMap("map");
    }
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
  }
}




