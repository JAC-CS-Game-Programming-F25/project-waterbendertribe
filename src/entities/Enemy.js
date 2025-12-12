import GameEntity from "./GameEntity.js";
import StateMachine from "../../../lib/StateMachine.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import EnemyIdlingState from "../states/enemy/EnemyIdlingState.js";
import EnemyWalkingState from "../states/enemy/EnemyWalkingState.js";
import EnemyChasingState from "../states/enemy/EnemyChasingState.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import Sprite from "../../lib/Sprite.js";
import Hitbox from "../../lib/Hitbox.js";
import ImageName from "../enums/ImageName.js";
import { context, DEBUG, images } from "../globals.js";

export default class Enemy extends GameEntity {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SCALE = 1.5;
  static PERCEPTION_RADIUS = 150; // How far enemy can "see" player
  static CHASE_SPEED = 80; // Speed when chasing player
  static WANDER_SPEED = 40; // Speed when wandering randomly

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
    this.type = type; // Store enemy type (color)

    // ✅ FIXED: Accept sprites from factory instead of loading internally
    this.walkingSprites = walkingSprites;
    this.runningSprites = runningSprites;
    this.sprites = this.walkingSprites; // Start with walking sprites

    this.dimensions = new Vector(Enemy.WIDTH, Enemy.HEIGHT);
    this.speed = Enemy.WANDER_SPEED;

    // Hitbox for collisions
    this.hitbox = new Hitbox(0, 0, 20, 20, "orange");
    this.hitboxOffsets = { x: 6, y: 6 };

    // Perception circle (for debug visualization)
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
  }

  updateHitbox() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y);

    this.hitbox.set(x + this.hitboxOffsets.x, y + this.hitboxOffsets.y, 20, 20);
  }

  render() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y);

    const cameraScale = this.map.camera.scale;
    const effectiveScale = Enemy.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);
    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    if (DEBUG) {
      // Draw hitbox
      this.hitbox.render(context);

      // Draw perception radius
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

    // Determine primary direction based on largest difference
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

    stateMachine.change(EnemyStateName.Idling);
    return stateMachine;
  }
}
