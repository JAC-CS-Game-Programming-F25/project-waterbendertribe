import Direction from "../enums/Direction.js";
import Tile from "../services/Tile.js";
import Vector from "../../lib/Vector.js";
import Hitbox from "../../lib/Hitbox.js";

export default class GameEntity {
  static WIDTH = 32;
  static HEIGHT = 48;

  constructor(entityDefinition = {}) {
    this.position = entityDefinition.position ?? new Vector();
    this.dimensions = entityDefinition.dimensions ?? new Vector();
    this.direction = entityDefinition.direction ?? Direction.Down;
    this.stateMachine = null;
    this.currentFrame = 0;
    this.sprites = [];
    this.speed = entityDefinition.speed ?? 1;
    this.totalHealth = entityDefinition.health ?? 1;
    this.health = this.totalHealth;
    this.damage = entityDefinition.damage ?? 1;
    this.hitboxOffsets = entityDefinition.hitboxOffsets ?? new Hitbox();
    this.hitbox = new Hitbox(
      this.position.x + this.hitboxOffsets.position.x,
      this.position.y + this.hitboxOffsets.position.y,
      this.dimensions.x + this.hitboxOffsets.dimensions.x,
      this.dimensions.y + this.hitboxOffsets.dimensions.y
    );

    //  Shared combat properties
    this.strength = entityDefinition.strength ?? 1;
    this.defense = entityDefinition.defense ?? 0;
    this.isDead = false;

    //  Shared claw/weapon hitbox
    this.clawHitbox = new Hitbox(0, 0, 0, 0);

    //  Shared invulnerability system
    this.isInvulnerable = false;
    this.alpha = 1;
    this.invulnerabilityTimer = null;

    //  Shared speed boost system
    this.speedBoostActive = false;
  }

  update(dt) {
    this.stateMachine?.update(dt);
  }

  //  Shared collision detection
  didCollideWithEntity(hitbox) {
    // Use claw hitbox when attacking, body hitbox otherwise
    if (this.isClawActive()) {
      return this.clawHitbox.didCollide(hitbox);
    }
    return this.hitbox.didCollide(hitbox);
  }

  //  Shared claw/weapon methods
  isClawActive() {
    return this.clawHitbox.dimensions.x > 0 && this.clawHitbox.dimensions.y > 0;
  }

  activateClawHitbox(x, y, width, height) {
    this.clawHitbox.set(x, y, width, height);
  }

  deactivateClawHitbox() {
    this.clawHitbox.set(0, 0, 0, 0);
  }

  //  Shared damage system
  receiveDamage(damage) {
    if (this.isDead || this.isInvulnerable) {
      return;
    }

    this.health -= damage;
    this.becomeInvulnerable();

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }

  //  Shared invulnerability system (can be overridden)
  becomeInvulnerable() {
    this.isInvulnerable = true;
  }

  render(x, y) {
    this.stateMachine?.render();
    this.sprites[this.currentFrame].render(x, y);
  }

  changeState(state, params) {
    this.stateMachine?.change(state, params);
  }
}
