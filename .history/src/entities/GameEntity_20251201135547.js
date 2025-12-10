import { getCollisionDirection, isAABBCollision } from '../../lib/Collision.js';
import Vector from '../../lib/Vector.js';

/**
 * Represents a game entity with position, dimensions, and velocity.
 */
export default class Entity {
	/**
	 * @param {number} x - Initial x position.
	 * @param {number} y - Initial y position.
	 * @param {number} width - Entity width.
	 * @param {number} height - Entity height.
	 */
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.position = new Vector(x, y);
		this.dimensions = new Vector(width, height);
		this.velocity = new Vector(0, 0);
		this.isOnGround = false;
	}

	/**
	 * Updates the entity state.
	 * @param {number} dt - Delta time.
	 */
	update(dt) {}

	/**
	 * Renders the entity.
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	render(context) {}
}
