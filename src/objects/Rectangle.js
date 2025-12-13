import GameMatter from "./GameMatter.js";
import { CANVAS_WIDTH, context, matter } from "../globals.js";

export default class Rectangle extends GameMatter {
  /**
   * A GameEntity that has a Matter rectangle as its body.
   * Canvas origin is top-left, Matter origin is center.
   * We'll work in top-left coordinates as usual but
   * offset them when giving/retrieving to/from Matter.
   *
   * @see https://brm.io/matter-js/docs/classes/Bodies.html#method_rectangle
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {object} options
   */
  constructor(x, y, width, height, options) {
    super(
      matter.Bodies.rectangle(
        x + width / 2,
        y + height / 2,
        width,
        height,
        options
      )
    );

    this.width = width;
    this.height = height;
  }

  update(dt) {
    super.update(dt);
  }
  
}
