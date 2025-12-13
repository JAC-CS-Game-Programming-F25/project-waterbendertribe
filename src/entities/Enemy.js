import GameEntity from "./GameEntity.js";
import StateMachine from "../../../lib/StateMachine.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import EnemyIdlingState from "../states/enemy/EnemyIdlingState.js";
import EnemyWalkingState from "../states/enemy/EnemyWalkingState.js";
import EnemyChasingState from "../states/enemy/EnemyChasingState.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import Hitbox from "../../lib/Hitbox.js";
import { context, DEBUG } from "../globals.js";
import EnemyAttackState from "../states/enemy/EnemyAttackState.js";

export default class Enemy extends GameEntity {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SCALE = 1.7;
  static PERCEPTION_RADIUS = 150;
  static CHASE_SPEED = 80;
  static WANDER_SPEED = 40;

  // Invulnerability settings (Zelda-style)
  static INVULNERABLE_DURATION = 0.5;
  static INVULNERABLE_FLASH_INTERVAL = 0.08;

  constructor(
    entityDefinition = {},
    map,
    player,
    walkingSprites,
    runningSprites,
    type
  ) {
    super(entityDefinition);

    this.map = map;
    this.player = player;
    this.type = type || "Enemy";

    this.walkingSprites = walkingSprites;
    this.runningSprites = runningSprites;
    this.sprites = this.walkingSprites;

    this.dimensions = new Vector(Enemy.WIDTH, Enemy.HEIGHT);
    this.speed = Enemy.WANDER_SPEED;

    // States
    this.totalHealth = entityDefinition.health ?? 6;
    this.health = this.totalHealth;
    this.speed = Enemy.WANDER_SPEED;
    this.strength = 1;
    this.defense = 0;

    this.isDead = false; // Death flag

    // Invulnerability system (Zelda-style)
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.flashTimer = 0;
    this.alpha = 1;

    // Hitbox for collisions
    this.hitbox = new Hitbox(0, 0, 20, 20, "orange");
    this.hitboxOffsets = { x: 6, y: 6 };

    this.clawHitbox = new Hitbox(0, 0, 0, 0, "yellow");

    this.perceptionRadius = Enemy.PERCEPTION_RADIUS;

    this.stateMachine = this.initializeStateMachine();
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);
    this.currentFrame = this.currentAnimation.getCurrentFrame();
    this.updateHitbox();
    this.updateInvulnerability(dt);
  }

  /**
   * Receive damage
   */
  receiveDamage(damage) {
    // Can't take damage while invulnerable or dead
    if (this.isDead || this.isInvulnerable) {
      return;
    }

    this.health -= damage;

    // Activate invulnerability after taking damage
    this.becomeInvulnerable();

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
    // sounds.play(SoundName.HitEnemy);
  }

  /**
   * Activate invulnerability frames after taking damage (Zelda-style)
   */
  becomeInvulnerable() {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = Enemy.INVULNERABLE_DURATION;
    this.flashTimer = Enemy.INVULNERABLE_FLASH_INTERVAL;
    this.alpha = 0.3;
  }

  /**
   * Update invulnerability timer and flashing effect (Zelda-style)
   */
  updateInvulnerability(dt) {
    if (!this.isInvulnerable) return;

    // Countdown invulnerability timer
    this.invulnerabilityTimer -= dt;

    // Update flash timer
    this.flashTimer -= dt;

    if (this.flashTimer <= 0) {
      // Toggle alpha for flashing effect
      this.alpha = this.alpha === 1 ? 0.3 : 1;
      this.flashTimer = Enemy.INVULNERABLE_FLASH_INTERVAL;
    }

    // End invulnerability
    if (this.invulnerabilityTimer <= 0) {
      this.isInvulnerable = false;
      this.alpha = 1;
    }
  }

  isClawActive() {
    return this.clawHitbox.dimensions.x > 0 && this.clawHitbox.dimensions.y > 0;
  }

  activateClawHitbox(x, y, width, height) {
    this.clawHitbox.set(x, y, width, height);
  }

  deactivateClawHitbox() {
    this.clawHitbox.set(0, 0, 0, 0);
  }

  updateHitbox() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y);

    this.hitbox.set(x + this.hitboxOffsets.x, y + this.hitboxOffsets.y, 20, 20);
  }

  /**
   * Check collision with entity using AABB collision detection
   * Uses CLAW hitbox when attacking, BODY hitbox otherwise
   * @param {Hitbox} hitbox - The hitbox to check collision against
   * @returns {boolean} Whether collision occurred
   */
  didCollideWithEntity(hitbox) {
    // If claw is active (attacking), check claw collision
    if (this.isClawActive()) {
      return this.clawHitbox.didCollide(hitbox);
    }
    // Otherwise check body collision
    return this.hitbox.didCollide(hitbox);
  }

  render() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y);

    const cameraScale = this.map.camera.scale;
    const effectiveScale = Enemy.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);

    // Apply alpha for invulnerability flashing
    context.globalAlpha = this.alpha;

    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    if (DEBUG) {
      // Draw hitbox
      this.hitbox.render(context);

      if (
        this.clawHitbox.dimensions.x > 0 &&
        this.clawHitbox.dimensions.y > 0
      ) {
        this.clawHitbox.render(context);
      }

      // Draw perception radius, in debugger mode you can see the radius of the perception of the enemy
      context.save();
      context.strokeStyle = this.isPlayerInRange() ? "red" : "yellow";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(
        x + Enemy.WIDTH / 2,
        y + Enemy.HEIGHT / 2,
        this.perceptionRadius,
        0,
        Math.PI * 2
      );
      context.stroke();
      context.restore();
    }
  }

  /**
   * Check if player is within perception range
   */
  isPlayerInRange() {
    const enemyCenterX = this.canvasPosition.x + Enemy.WIDTH / 2;
    const enemyCenterY = this.canvasPosition.y + Enemy.HEIGHT / 2;

    const playerCenterX =
      this.player.canvasPosition.x + (32 * this.player.constructor.SCALE) / 2;
    const playerCenterY =
      this.player.canvasPosition.y + (32 * this.player.constructor.SCALE) / 2;

    const distance = Math.sqrt(
      Math.pow(playerCenterX - enemyCenterX, 2) +
        Math.pow(playerCenterY - enemyCenterY, 2)
    );

    return distance <= this.perceptionRadius;
  }

  /**
   * Get direction towards player
   */
  getDirectionToPlayer() {
    const enemyCenterX = this.canvasPosition.x + Enemy.WIDTH / 2;
    const enemyCenterY = this.canvasPosition.y + Enemy.HEIGHT / 2;

    const playerCenterX =
      this.player.canvasPosition.x + (32 * this.player.constructor.SCALE) / 2;
    const playerCenterY =
      this.player.canvasPosition.y + (32 * this.player.constructor.SCALE) / 2;

    const dx = playerCenterX - enemyCenterX;
    const dy = playerCenterY - enemyCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.Right : Direction.Left;
    } else {
      return dy > 0 ? Direction.Down : Direction.Up;
    }
  }

  initializeStateMachine() {
    const stateMachine = new StateMachine();

    stateMachine.add(EnemyStateName.Idling, new EnemyIdlingState(this));
    stateMachine.add(EnemyStateName.Walking, new EnemyWalkingState(this));
    stateMachine.add(EnemyStateName.Chasing, new EnemyChasingState(this));
    stateMachine.add(EnemyStateName.Attacking, new EnemyAttackState(this));

    stateMachine.change(EnemyStateName.Idling);
    return stateMachine;
  }
}
