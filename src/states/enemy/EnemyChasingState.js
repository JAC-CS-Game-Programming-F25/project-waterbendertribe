import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";

export default class EnemyChasingState extends State {
  static ATTACK_RANGE = 40; // Stop moving when this close to player

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
    this.enemy.speed = this.enemy.constructor.CHASE_SPEED;
    this.directionUpdateCooldown = 0;
  }

  update(dt) {
    // Check if player is still in range
    if (!this.enemy.isPlayerInRange()) {
      // Player escaped - go back to walking
      this.enemy.changeState(EnemyStateName.Walking);
      return;
    }

    // Check if enemy is close enough to attack (stop moving)
    if (this.isInAttackRange()) {
      // Stop moving - just face the player
      this.enemy.direction = this.enemy.getDirectionToPlayer();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
      // TODO: Add attack animation/logic here
      return; // Don't chase - we're in attack range
    }

    // Update direction cooldown
    this.directionUpdateCooldown -= dt;

    // Only update direction periodically for smoother movement
    if (this.directionUpdateCooldown <= 0) {
      this.enemy.direction = this.enemy.getDirectionToPlayer();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
      this.directionUpdateCooldown = this.directionUpdateInterval;
    }

    this.chase(dt);
  }

  /**
   * Check if enemy is close enough to player to stop chasing
   */
  isInAttackRange() {
    const enemyCenterX =
      this.enemy.canvasPosition.x + this.enemy.constructor.WIDTH / 2;
    const enemyCenterY =
      this.enemy.canvasPosition.y + this.enemy.constructor.HEIGHT / 2;

    const playerCenterX =
      this.enemy.player.canvasPosition.x +
      (32 * this.enemy.player.constructor.SCALE) / 2;
    const playerCenterY =
      this.enemy.player.canvasPosition.y +
      (32 * this.enemy.player.constructor.SCALE) / 2;

    const distance = Math.sqrt(
      Math.pow(playerCenterX - enemyCenterX, 2) +
        Math.pow(playerCenterY - enemyCenterY, 2)
    );

    return distance <= EnemyChasingState.ATTACK_RANGE;
  }

  chase(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newCanvasX = this.enemy.canvasPosition.x;
    let newCanvasY = this.enemy.canvasPosition.y;

    // Move in ONE direction at a time (no diagonal movement)
    switch (this.enemy.direction) {
      case Direction.Up:
        newCanvasY -= moveDelta;
        break;
      case Direction.Down:
        newCanvasY += moveDelta;
        break;
      case Direction.Left:
        newCanvasX -= moveDelta;
        break;
      case Direction.Right:
        newCanvasX += moveDelta;
        break;
    }

    // Check map boundaries and collisions
    if (this.isValidMove(newCanvasX, newCanvasY)) {
      this.enemy.canvasPosition.x = newCanvasX;
      this.enemy.canvasPosition.y = newCanvasY;
      this.enemy.position.x = Math.floor(newCanvasX / Tile.SIZE);
      this.enemy.position.y = Math.floor(newCanvasY / Tile.SIZE);
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
    let newCanvasX = this.enemy.canvasPosition.x;
    let newCanvasY = this.enemy.canvasPosition.y;

    // If moving horizontally and blocked, try vertical
    if (
      this.enemy.direction === Direction.Left ||
      this.enemy.direction === Direction.Right
    ) {
      // Try moving up or down instead
      const playerCenterY = this.enemy.player.canvasPosition.y + 16;
      const enemyCenterY =
        this.enemy.canvasPosition.y + this.enemy.constructor.HEIGHT / 2;

      if (playerCenterY > enemyCenterY) {
        newCanvasY += moveDelta;
      } else {
        newCanvasY -= moveDelta;
      }
    }
    // If moving vertically and blocked, try horizontal
    else {
      const playerCenterX = this.enemy.player.canvasPosition.x + 16;
      const enemyCenterX =
        this.enemy.canvasPosition.x + this.enemy.constructor.WIDTH / 2;

      if (playerCenterX > enemyCenterX) {
        newCanvasX += moveDelta;
      } else {
        newCanvasX -= moveDelta;
      }
    }

    // Try the alternate path
    if (this.isValidMove(newCanvasX, newCanvasY)) {
      this.enemy.canvasPosition.x = newCanvasX;
      this.enemy.canvasPosition.y = newCanvasY;
      this.enemy.position.x = Math.floor(newCanvasX / Tile.SIZE);
      this.enemy.position.y = Math.floor(newCanvasY / Tile.SIZE);
    }
    // If still blocked, enemy just stops this frame
  }

  isValidMove(canvasX, canvasY) {
    // Check map boundaries
    const mapWidth = this.enemy.map.width * Tile.SIZE;
    const mapHeight = this.enemy.map.height * Tile.SIZE;

    if (canvasX < 0 || canvasX + this.enemy.constructor.WIDTH > mapWidth) {
      return false;
    }
    if (canvasY < 0 || canvasY + this.enemy.constructor.HEIGHT > mapHeight) {
      return false;
    }

    // Check collision layer
    const tileX = Math.floor(
      (canvasX + this.enemy.constructor.WIDTH / 2) / Tile.SIZE
    );
    const tileY = Math.floor(
      (canvasY + this.enemy.constructor.HEIGHT / 2) / Tile.SIZE
    );

    return this.enemy.map.collisionLayer.getTile(tileX, tileY) === null;
  }
}
