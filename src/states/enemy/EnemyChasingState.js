import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import Player from "../../entities/player/Player.js";
import Enemy from "../../entities/Enemy.js";

export default class EnemyChasingState extends State {
  static ATTACK_RANGE = 35; // Stop moving when this close to player

  constructor(enemy) {
    super();
    this.enemy = enemy;

    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3], 0.08),
      [Direction.Down]: new Animation([8, 9, 10, 11], 0.08),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.08),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.08),
    };

    // Cooldown to prevent rapid direction changes
    this.directionUpdateCooldown = 0;
    this.directionUpdateInterval = 0.2; // Update direction every 0.2 seconds
  }

  enter() {
    this.enemy.speed = Enemy.CHASE_SPEED;
    this.directionUpdateCooldown = 0;
  }

  update(dt) {
    // Check if target is still in range
    if (!this.enemy.isTargetInRange()) {
      // Lost target - go back to walking
      this.enemy.changeState(EnemyStateName.Walking);
      return;
    }

    // Check if we reached a ball (power-up)
    if (this.enemy.targetType === "ball" && this.isInPickupRange()) {
      this.pickupBall();
      this.enemy.changeState(EnemyStateName.Idling);
      return;
    }

    // Check if enemy is close enough to attack player or enemy
    if (
      (this.enemy.targetType === "player" ||
        this.enemy.targetType === "enemy") &&
      this.isInAttackRange()
    ) {
      this.enemy.direction = this.enemy.getDirectionToTarget();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
      this.enemy.changeState(EnemyStateName.Attacking);
      return;
    }

    // Update direction cooldown
    this.directionUpdateCooldown -= dt;

    // Only update direction periodically for smoother movement
    if (this.directionUpdateCooldown <= 0) {
      this.enemy.direction = this.enemy.getDirectionToTarget();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
      this.directionUpdateCooldown = this.directionUpdateInterval;
    }

    this.chase(dt);
  }

  /**
   * Check if enemy is close enough to target to attack
   */
  isInAttackRange() {
    if (!this.enemy.currentTarget) return false;

    const distance = this.enemy.getDistanceTo(
      this.enemy.currentTarget.canvasPosition ||
        this.enemy.currentTarget.position
    );

    return distance <= EnemyChasingState.ATTACK_RANGE;
  }

  /**
   * Check if enemy is close enough to ball to pick it up
   */
  isInPickupRange() {
    if (!this.enemy.currentTarget || this.enemy.targetType !== "ball")
      return false;

    const distance = this.enemy.getDistanceTo(
      this.enemy.currentTarget.position
    );

    return distance <= EnemyChasingState.PICKUP_RANGE;
  }

  /**
   * Pick up the ball (trigger its effect)
   */
  pickupBall() {
    if (this.enemy.currentTarget && !this.enemy.currentTarget.wasConsumed) {
      // Trigger ball's onConsume with the enemy
      this.enemy.currentTarget.onConsume(this.enemy);
    }
  }

  chase(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newPositionX = this.enemy.position.x;
    let newPositionY = this.enemy.position.y;

    // Move in ONE direction at a time (no diagonal movement)
    switch (this.enemy.direction) {
      case Direction.Up:
        newPositionY -= moveDelta;
        break;
      case Direction.Down:
        newPositionY += moveDelta;
        break;
      case Direction.Left:
        newPositionX -= moveDelta;
        break;
      case Direction.Right:
        newPositionX += moveDelta;
        break;
    }

    // Check map boundaries and collisions
    if (this.isValidMove(newPositionX, newPositionY)) {
      this.enemy.position.x = newPositionX;
      this.enemy.position.y = newPositionY;
    } else {
      // Blocked - try to find alternate path
      this.tryAlternatePath(dt);
    }
  }

  /**
   * If blocked, try moving perpendicular to get around obstacle
   */
  tryAlternatePath(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newPositionX = this.enemy.position.x;
    let newPositionY = this.enemy.position.y;

    // If moving horizontally and blocked, try vertical
    if (
      this.enemy.direction === Direction.Left ||
      this.enemy.direction === Direction.Right
    ) {
      // Try moving up or down instead
      const playerCenterY = this.enemy.player.position.y + 16;
      const enemyCenterY = this.enemy.position.y + Enemy.HEIGHT / 2;

      if (playerCenterY > enemyCenterY) {
        newPositionY += moveDelta;
      } else {
        newPositionY -= moveDelta;
      }
    }
    // If moving vertically and blocked, try horizontal
    else {
      const playerCenterX = this.enemy.player.position.x + 16;
      const enemyCenterX = this.enemy.position.x + Enemy.WIDTH / 2;

      if (playerCenterX > enemyCenterX) {
        newPositionX += moveDelta;
      } else {
        newPositionX -= moveDelta;
      }
    }

    // Try the alternate path
    if (this.isValidMove(newPositionX, newPositionY)) {
      this.enemy.position.x = newPositionX;
      this.enemy.position.y = newPositionY;
    }
    // If still blocked, enemy just stops this frame
  }

  isValidMove(positionX, positionY) {
    // Check map boundaries
    const mapWidth = this.enemy.map.width * Tile.SIZE;
    const mapHeight = this.enemy.map.height * Tile.SIZE;

    if (positionX < 0 || positionX + Enemy.WIDTH > mapWidth) {
      return false;
    }
    if (positionY < 0 || positionY + Enemy.HEIGHT > mapHeight) {
      return false;
    }

    // Check collision layer
    const tileX = Math.floor((positionX + Enemy.WIDTH / 2) / Tile.SIZE);
    const tileY = Math.floor((positionY + Enemy.HEIGHT / 2) / Tile.SIZE);

    return this.enemy.map.collisionLayer.getTile(tileX, tileY) === null;
  }
}
