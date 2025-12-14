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
import Tile from "../services/Tile.js";
import Player from "./player/Player.js";

export default class Enemy extends GameEntity {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SCALE = 1.7;
  static PERCEPTION_RADIUS = 150; // Detection range for all targets
  static CHASE_SPEED = 80;
  static WANDER_SPEED = 40;

  // Invulnerability settings (Zelda-style)
  static INVULNERABLE_DURATION = 0.5;
  static INVULNERABLE_FLASH_INTERVAL = 0.08;

  // AI priorities (what to chase first)
  static PRIORITY_PLAYER = 3; // Highest priority
  static PRIORITY_BALL = 2; // Medium priority
  static PRIORITY_ENEMY = 1;

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
    this.hitbox = new Hitbox(0, 0, 20, 12, "red");
    this.hitboxOffsets = { x: 8.5, y: 37 };

    this.clawHitbox = new Hitbox(0, 0, 0, 0, "yellow");

    this.perceptionRadius = Enemy.PERCEPTION_RADIUS;

    // AI target tracking
    this.currentTarget = null; // What enemy is currently chasing
    this.targetType = null; // 'player', 'enemy', or 'ball'

    this.stateMachine = this.initializeStateMachine();
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);
    this.currentFrame = this.currentAnimation.getCurrentFrame();
    this.updateBodyHitbox();
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

  updateBodyHitbox() {
    // NOW: position is already in pixels
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y - this.dimensions.y / 2);

    this.hitbox.set(x + this.hitboxOffsets.x, y + this.hitboxOffsets.y, 20, 12);
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
    // NOW: position is already in pixels
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);

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
      this.hitbox.render(context);

      if (
        this.clawHitbox.dimensions.x > 0 &&
        this.clawHitbox.dimensions.y > 0
      ) {
        this.clawHitbox.render(context);
      }

      // Draw perception radius with color based on target
      context.save();
      let color = "yellow"; // No target
      if (this.currentTarget) {
        if (this.targetType === "player") color = "red";
        else if (this.targetType === "enemy") color = "orange";
        else if (this.targetType === "ball") color = "cyan";
      }
      context.strokeStyle = color;
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
   * Find the best target to chase based on priority and distance
   * Returns {target, type, distance} or null
   */
  findBestTarget() {
    const targets = [];

    // Check player
    const playerDist = this.getDistanceTo(this.player.position);
    if (playerDist <= this.perceptionRadius) {
      targets.push({
        target: this.player,
        type: "player",
        distance: playerDist,
        priority: Enemy.PRIORITY_PLAYER,
      });
    }

    // Check other enemies
    this.map.enemies.forEach((otherEnemy) => {
      if (otherEnemy === this || otherEnemy.isDead) return;

      const enemyDist = this.getDistanceTo(otherEnemy.position);
      if (enemyDist <= this.perceptionRadius) {
        targets.push({
          target: otherEnemy,
          type: "enemy",
          distance: enemyDist,
          priority: Enemy.PRIORITY_ENEMY,
        });
      }
    });

    // Check balls (power-ups)
    this.map.balls.forEach((ball) => {
      if (ball.cleanUp || ball.wasConsumed) return;

      const ballDist = this.getDistanceTo(ball.position);
      if (ballDist <= this.perceptionRadius) {
        targets.push({
          target: ball,
          type: "ball",
          distance: ballDist,
          priority: Enemy.PRIORITY_BALL,
        });
      }
    });

    // No targets found
    if (targets.length === 0) return null;

    // Sort by priority (highest first), then by distance (closest first)
    targets.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.distance - b.distance; // Closer target first
    });

    return targets[0];
  }

  // Check if any valid target is in range
  isTargetInRange() {
    const bestTarget = this.findBestTarget();
    if (bestTarget) {
      this.currentTarget = bestTarget.target;
      this.targetType = bestTarget.type;
      return true;
    }

    this.currentTarget = null;
    this.targetType = null;
    return false;
  }

  // This will give the distance between the target to the enemy or the ball
  getDistanceTo(targetPosition) {
    const enemyCenterX = this.position.x + Enemy.WIDTH / 2;
    const enemyCenterY = this.position.y + Enemy.HEIGHT / 2;

    let targetCenterX, targetCenterY;

    // Handle different target types
    if (targetPosition.x !== undefined) {
      targetCenterX = targetPosition.x;
      targetCenterY = targetPosition.y;
    } else {
      targetCenterX = targetPosition.x;
      targetCenterY = targetPosition.y;
    }

    return Math.sqrt(
      Math.pow(targetCenterX - enemyCenterX, 2) +
        Math.pow(targetCenterY - enemyCenterY, 2)
    );
  }

  // This will get the target's direction
  getDirectionToTarget() {
    if (!this.currentTarget) return this.direction;

    const enemyCenterX = this.position.X + Enemy.Width / 2;
    const enemyCenterY = this.position.Y + Enemy.Width / 2;

    let targetCenterX, targetCenterY;

    if (this.targetType === "player") {
      targetCenterX = this.currentTarget.position.x + (32 * Player.SCALE) / 2;
      targetCenterY = this.currentTarget.position.y + (32 * Player.SCALE) / 2;
    } else if (this.targetType === "enemy") {
      targetCenterX = this.currentTarget.position.x + Enemy.WIDTH / 2;
      targetCenterY = this.currentTarget.position.y + Enemy.HEIGHT / 2;
    } else if (this.targetType === "ball") {
      // Balls use 'position' not 'position'
      targetCenterX = this.currentTarget.position.x;
      targetCenterY = this.currentTarget.position.y;
    } else {
      // Fallback - shouldn't happen
      return this.direction;
    }

    const dx = targetCenterX - enemyCenterX;
    const dy = targetCenterY - enemyCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.Right : Direction.Left;
    } else {
      return dy > 0 ? Direction.Down : Direction.Up;
    }
  }

  // /**
  //  * Check if player is within perception range
  //  */
  // isPlayerInRange() {
  //   this.map.array.forEach(element => {
  //     const enemyCenterX = this.position.x + Enemy.WIDTH / 2;
  //     const enemyCenterY = this.position.y + Enemy.HEIGHT / 2;

  //     const elementCenter = this.player.position.x + (32 * )
  //   });
  //   const enemyCenterX = this.position.x + Enemy.WIDTH / 2;
  //   const enemyCenterY = this.position.y + Enemy.HEIGHT / 2;

  //   const playerCenterX =
  //     this.player.position.x + (32 * this.player.constructor.SCALE) / 2;
  //   const playerCenterY =
  //     this.player.position.y + (32 * this.player.constructor.SCALE) / 2;

  //   const distance = Math.sqrt(
  //     Math.pow(playerCenterX - enemyCenterX, 2) +
  //       Math.pow(playerCenterY - enemyCenterY, 2)
  //   );

  //   return distance <= this.perceptionRadius;
  // }

  // /**
  //  * Get direction towards player - IMPROVED VERSION
  //  * Now properly handles diagonal cases and adds a threshold to prevent jittering
  //  */
  // getDirectionToPlayer() {
  //   // NOW: position is already in pixels
  //   const enemyCenterX = this.position.x + Enemy.WIDTH / 2;
  //   const enemyCenterY = this.position.y + Enemy.HEIGHT / 2;

  //   const playerCenterX =
  //     this.player.position.x + (32 * this.player.constructor.SCALE) / 2;
  //   const playerCenterY =
  //     this.player.position.y + (32 * this.player.constructor.SCALE) / 2;

  //   const dx = playerCenterX - enemyCenterX;
  //   const dy = playerCenterY - enemyCenterY;

  //   const absDx = Math.abs(dx);
  //   const absDy = Math.abs(dy);

  //   // Add a small threshold to prevent jittering when distances are very similar
  //   const THRESHOLD = 5; // pixels

  //   // If horizontal distance is significantly larger, move horizontally
  //   if (absDx > absDy + THRESHOLD) {
  //     return dx > 0 ? Direction.Right : Direction.Left;
  //   }
  //   // If vertical distance is significantly larger, move vertically
  //   else if (absDy > absDx + THRESHOLD) {
  //     return dy > 0 ? Direction.Down : Direction.Up;
  //   }
  //   // When they're roughly equal, alternate based on which is slightly larger
  //   // This prevents always choosing vertical
  //   else {
  //     if (absDx >= absDy) {
  //       return dx > 0 ? Direction.Right : Direction.Left;
  //     } else {
  //       return dy > 0 ? Direction.Down : Direction.Up;
  //     }
  //   }
  // }

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
