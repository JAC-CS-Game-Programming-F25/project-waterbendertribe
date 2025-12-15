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

export default class Enemy extends GameEntity {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SCALE = 1.7;
  static PERCEPTION_RADIUS = 150;
  static CHASE_SPEED = 100;
  static WANDER_SPEED = 40;

  static INVULNERABLE_DURATION = 0.5;
  static INVULNERABLE_FLASH_INTERVAL = 0.08;

  static PRIORITY_PLAYER = 3;
  static PRIORITY_BALL = 2;
  static PRIORITY_ENEMY = 1;

  constructor(
    entityDefinition = {},
    map,
    player,
    walkingSprites,
    runningSprites,
    type
  ) {
    super({
      ...entityDefinition,
      health: entityDefinition.health ?? 6,
      strength: 1,
      defense: 0,
    });

    this.map = map;
    this.player = player;
    this.type = type || "Enemy";

    this.walkingSprites = walkingSprites;
    this.runningSprites = runningSprites;
    this.sprites = this.walkingSprites;

    this.dimensions = new Vector(Enemy.WIDTH, Enemy.HEIGHT);
    this.speed = Enemy.WANDER_SPEED;

    // Enemy-specific hitbox positioning
    this.hitbox = new Hitbox(0, 0, 20, 12, "red");
    this.hitboxOffsets = { x: 8.5, y: 37 };

    // Enemy-specific invulnerability (manual flash timer)
    this.invulnerabilityTimer = 0;
    this.flashTimer = 0;

    this.perceptionRadius = Enemy.PERCEPTION_RADIUS;

    // AI tracking
    this.currentTarget = null;
    this.targetType = null;

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

  updateBodyHitbox() {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y - this.dimensions.y / 2);

    this.hitbox.set(x + this.hitboxOffsets.x, y + this.hitboxOffsets.y, 20, 12);
  }

  //  Override: Enemy-specific invulnerability with manual countdown
  becomeInvulnerable() {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = Enemy.INVULNERABLE_DURATION;
    this.flashTimer = Enemy.INVULNERABLE_FLASH_INTERVAL;
    this.alpha = 0.3;
  }

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

  render() {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);

    const cameraScale = this.map.camera.scale;
    const effectiveScale = Enemy.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);
    context.globalAlpha = this.alpha;

    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    if (DEBUG) {
      this.hitbox.render(context);

      if (this.isClawActive()) {
        this.clawHitbox.render(context);
      }

      // Draw perception radius with color based on target
      context.save();
      let color = "yellow";
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

  findBestTarget() {
    const targets = [];

    const playerDist = this.getDistanceTo(this.player.position);
    if (playerDist <= this.perceptionRadius) {
      targets.push({
        target: this.player,
        type: "player",
        distance: playerDist,
        priority: Enemy.PRIORITY_PLAYER,
      });
    }

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

    if (!this.speedBoostActive) {
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
    }

    if (targets.length === 0) return null;

    targets.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.distance - b.distance;
    });

    return targets[0];
  }

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

  getDistanceTo(targetPosition) {
    const enemyCenterX = this.position.x + Enemy.WIDTH / 2;
    const enemyCenterY = this.position.y + Enemy.HEIGHT / 2;

    let targetCenterX, targetCenterY;

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
