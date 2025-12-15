import GameEntity from "./GameEntity.js";
import StateMachine from "../../../lib/StateMachine.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import EnemyIdlingState from "../states/enemy/EnemyIdlingState.js";
import EnemyWalkingState from "../states/enemy/EnemyWalkingState.js";
import EnemyChasingState from "../states/enemy/EnemyChasingState.js";
import EnemyRunningState from "../states/enemy/EnemyRunningState.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import Hitbox from "../../lib/Hitbox.js";
import { context, DEBUG } from "../globals.js";
import EnemyAttackState from "../states/enemy/EnemyAttackState.js";
import Tile from "../services/Tile.js";
import Player from "./player/Player.js";
import Ball from "../objects/Ball.js";
import Color from "../enums/Color.js";
import InteractType from "../enums/InteractType.js";

export default class Enemy extends GameEntity {
  // Basic enemy size and behavior settings
  static WIDTH = 32;
  static HEIGHT = 32;
  static SCALE = 1.7;

  static PERCEPTION_RADIUS = 150;
  static CHASE_SPEED = 100;
  static WANDER_SPEED = 40;

  // Invulnerability timing after taking damage
  static INVULNERABLE_DURATION = 0.5;
  static INVULNERABLE_FLASH_INTERVAL = 0.08;

  //target selection priority
  static PRIORITY_PLAYER = 3;
  static PRIORITY_BALL = 2;
  static PRIORITY_ENEMY = 1;

  /**
   * Creates an enemy with AI, animations, hitboxes, and state machine
   */
  constructor(entityDefinition = {}, map, walkingSprites, runningSprites) {
    super({
      ...entityDefinition,
    });

    this.map = map;
    this.player = this.map.player;

    // Sprite sets for different movement states
    this.walkingSprites = walkingSprites;
    this.runningSprites = runningSprites;
    this.sprites = this.walkingSprites;

    this.dimensions = new Vector(Enemy.WIDTH, Enemy.HEIGHT);

    // Hitbox for collision and combat detection
    this.hitbox = new Hitbox(0, 0, 20, 12, "red");
    this.hitboxOffsets = { x: 8.5, y: 37 };

    // Invulnerability handling
    this.invulnerabilityTimer = 0;
    this.flashTimer = 0;

    // AI targeting data
    this.perceptionRadius = Enemy.PERCEPTION_RADIUS;
    this.currentTarget = null;
    this.targetType = null;

    // State machine controls enemy behavior
    this.stateMachine = this.initializeStateMachine();
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  /**
   * Updates enemy logic, animation, hitbox, and invulnerability state
   */
  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);
    this.currentFrame = this.currentAnimation.getCurrentFrame();
    this.updateBodyHitbox();
    this.updateInvulnerability(dt);
  }

  /**
   * Updates the position of the enemy'shitbox based on its sprite
   */
  updateBodyHitbox() {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y - this.dimensions.y / 2);

    this.hitbox.set(x + this.hitboxOffsets.x, y + this.hitboxOffsets.y, 20, 12);
  }

  /**
   *Makes the enemy temporarily invulnerable after taking damage
   */
  becomeInvulnerable() {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = Enemy.INVULNERABLE_DURATION;
    this.flashTimer = Enemy.INVULNERABLE_FLASH_INTERVAL;
    this.alpha = 0.3;
  }

  /**
   * Handles invulnerability timing and flashing effects
   */
  updateInvulnerability(dt) {
    if (!this.isInvulnerable) return;

    this.invulnerabilityTimer -= dt;
    this.flashTimer -= dt;

    if (this.flashTimer <= 0) {
      this.alpha = this.alpha === 1 ? 0.3 : 1;
      this.flashTimer = Enemy.INVULNERABLE_FLASH_INTERVAL;
    }

    if (this.invulnerabilityTimer <= 0) {
      this.isInvulnerable = false;
      this.alpha = 1;
    }
  }

  /**
   * Renders the enemy sprite and optional debug visuals
   */
  render() {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);

    // Adjust scaling based on camera zoom
    const cameraScale = this.map.camera.scale;
    const effectiveScale = Enemy.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);
    context.globalAlpha = this.alpha;

    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    // Debug visuals
    if (DEBUG) {
      this.hitbox.render(context);

      if (this.isClawActive()) {
        this.clawHitbox.render(context);
      }

      // Draw perception radius with color based on target type
      context.save();
      let color = Color.Yellow;
      if (this.currentTarget) {
        if (this.targetType === InteractType.Player) color = Color.Red;
        else if (this.targetType === InteractType.Enemy) color = Color.Orange;
        else if (this.targetType === InteractType.Ball) color = Color.Cyan;
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
   * Finds the best target within perceptio range based on priority and distance
   */
  findBestTarget() {
    const targets = [];

    // Player detection
    const playerDist = this.getDistanceTo(this.player.position);
    if (playerDist <= this.perceptionRadius) {
      targets.push({
        target: this.player,
        type: "player",
        distance: playerDist,
        priority: Enemy.PRIORITY_PLAYER,
      });
    }

    //other enemies detection
    this.map.enemies.forEach((otherEnemy) => {
      if (otherEnemy === this || otherEnemy.isDead) return;

      const enemyDist = this.getDistanceTo(otherEnemy.position);
      if (enemyDist <= this.perceptionRadius) {
        targets.push({
          target: otherEnemy,
          type: InteractType.Enemy,
          distance: enemyDist,
          priority: Enemy.PRIORITY_ENEMY,
        });
      }
    });

    //ball detection (disabled when speed boosted)
    if (!this.speedBoostActive) {
      this.map.balls.forEach((ball) => {
        if (ball.cleanUp || ball.wasConsumed) return;

        const ballDist = this.getDistanceTo(ball.position);
        if (ballDist <= this.perceptionRadius) {
          targets.push({
            target: ball,
            type: InteractType.Ball,
            distance: ballDist,
            priority: Enemy.PRIORITY_BALL,
          });
        }
      });
    }

    if (targets.length === 0) return null;

    // Sort by priority first, then distance
    targets.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.distance - b.distance;
    });

    return targets[0];
  }

  /**
   * checks if any valid target is within range and sets it
   */
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

  /**
   * Calculates distance from this enemy to a targetposition
   */
  getDistanceTo(targetPosition) {
    const enemyCenterX = this.position.x + Enemy.WIDTH / 2;
    const enemyCenterY = this.position.y + Enemy.HEIGHT / 2;

    return Math.sqrt(
      Math.pow(targetPosition.x - enemyCenterX, 2) +
        Math.pow(targetPosition.y - enemyCenterY, 2)
    );
  }

  /**
   * determines which direction theenemy should face based on target position
   */
  getDirectionToTarget() {
    if (!this.currentTarget) return this.direction;

    const dx = this.currentTarget.position.x - this.position.x;
    const dy = this.currentTarget.position.y - this.position.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.Right : Direction.Left;
    } else {
      return dy > 0 ? Direction.Down : Direction.Up;
    }
  }

  /**
   * Initializes the enemy AI state machine and sets the default state
   */
  initializeStateMachine() {
    const stateMachine = new StateMachine();

    stateMachine.add(EnemyStateName.Idling, new EnemyIdlingState(this));
    stateMachine.add(EnemyStateName.Walking, new EnemyWalkingState(this));
    stateMachine.add(EnemyStateName.Chasing, new EnemyChasingState(this));
    stateMachine.add(EnemyStateName.Attacking, new EnemyAttackState(this));
    stateMachine.add(EnemyStateName.Running, new EnemyRunningState(this));

    stateMachine.change(EnemyStateName.Idling);
    return stateMachine;
  }
}
