import Vector from "../../lib/Vector.js";
import GameObject from "./GameObject.js";

export default class Circle extends GameObject{
  constructor(cx = 0, cy = 0, radius = 0, colour = "red") {
	super();

    this.colour = colour;
    this.setCenter(cx, cy);
    this.radius = radius;
  }

  setCenter(cx, cy) {
    this.center = new Vector(cx, cy);
  }

  setRadius(r) {
    this.radius = r;
  }

  // Target is expected to be an AABB Hitbox with position (top-left) and dimensions
  didCollide(target) {
    const circleX = this.center.x;
    const circleY = this.center.y;
    const rectX = target.position.x;
    const rectY = target.position.y;
    const rectW = target.dimensions.x;
    const rectH = target.dimensions.y;

    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(rectX, Math.min(circleX, rectX + rectW));
    const closestY = Math.max(rectY, Math.min(circleY, rectY + rectH));

    // Calculate the distance between the circle's center and this closest point
    const dx = circleX - closestX;
    const dy = circleY - closestY;

    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  }

  render(context) {
    context.save();
    context.strokeStyle = this.colour;
    context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
    context.restore();
  }
}

// import GameObject from "../objects/GameObject.js"
// import {
// 	CANVAS_HEIGHT,
// 	CANVAS_WIDTH,
// 	context,
// 	matter
// } from "../globals.js";

// export default class Circle extends GameObject {

// 	/**
// 	 * A GameEntity that has a Matter circle as its body.
// 	 * Both Canvas and Matter use the center of their circles
// 	 * for the origin so we don't have to worry about offsetting.
// 	 *
// 	 * @see https://brm.io/matter-js/docs/classes/Bodies.html#method_circle
// 	 *
// 	 * @param {number} x
// 	 * @param {number} y
// 	 * @param {number} radius
// 	 * @param {object} options
// 	 */
// 	constructor(x, y, radius, options) {
// 		super(matter.Bodies.circle(x, y, radius, options));

// 		this.radius = radius;
// 	}

// 	update(dt) {
// 		// if (this.didGoOffScreen()) {
// 		// 	this.shouldCleanUp = true;
// 		// }

// 		super.update(dt);
// 	}

// 	render() {
// 		super.render(() => {
// 			context.beginPath();
// 			context.arc(0, 0, this.radius, 0, 2 * Math.PI);
// 			context.closePath();
// 			context.lineWidth = 4;
// 			context.strokeStyle = 'blue';
// 			context.stroke();
// 			context.beginPath();
// 			context.moveTo(0, 0);
// 			context.lineTo(this.radius, 0)
// 			context.closePath();
// 			context.stroke();
// 		});
// 	}
// }

