import Direction from "../enums/Direction.js";
import Tile from "../services/Tile.js";
import Vector from "../../lib/Vector.js";
import Hitbox from "../../lib/Hitbox.js";

export default class GameEntity {
  static WIDTH = 32;
  static HEIGHT = 48;

  /**
   * The base class to be extended by all entities in the game.
   * Right now we just have one Player character, but this could
   * be extended to implement NPCs (Non Player Characters) as well.
   *
   * @param {object} entityDefinition
   */
  constructor(entityDefinition = {}) {
    this.position = entityDefinition.position ?? new Vector();
    this.canvasPosition = new Vector(
      Math.floor(this.position.x * Tile.SIZE),
      Math.floor(this.position.y * Tile.SIZE)
    );
    this.dimensions = entityDefinition.dimensions ?? new Vector();
    this.direction = entityDefinition.direction ?? Direction.Down;
    this.stateMachine = null;
    this.currentFrame = 0;
    this.sprites = [];
    this.speed = entityDefinition.speed ?? 1;
    this.totalHealth = entityDefinition.health ?? 1;
    this.damage = entityDefinition.damage ?? 1;
    this.hitboxOffsets = entityDefinition.hitboxOffsets ?? new Hitbox();
    this.hitbox = new Hitbox(
      this.position.x + this.hitboxOffsets.position.x,
      this.position.y + this.hitboxOffsets.position.y,
      this.dimensions.x + this.hitboxOffsets.dimensions.x,
      this.dimensions.y + this.hitboxOffsets.dimensions.y
    );
  }

  /**
   * At this time, stateMachine will be null for Pokemon.
   */
  update(dt) {
    this.stateMachine?.update(dt);
  }
  /**
   * @param {Hitbox} hitbox
   * @returns Whether this hitbox collided with another using AABB collision detection.
   */
  didCollideWithEntity(hitbox) {
    return this.hitbox.didCollide(hitbox);
  }

  render(x, y) {
    this.stateMachine?.render();
    this.sprites[this.currentFrame].render(x, y);
  }

  changeState(state, params) {
    this.stateMachine?.change(state, params);
  }
}
