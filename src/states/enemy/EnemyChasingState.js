import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import Player from "../../entities/player/Player.js";
import Enemy from "../../entities/Enemy.js";
import InteractType from "../../enums/InteractType.js";

export default class EnemyChasingState extends State {
  // Distance thresholds for interactions
  static ATTACK_RANGE = 35;
  static PICKUP_RANGE = 30;

  // Speed used when enemy is boosted
  static SPEED_BOOST = 200;

  /**
   * Handles enemy behavior when actively chasing a target
   */
  constructor(enemy) {
    super();
    this.enemy = enemy;

    // Walking animations (normal speed)
    this.walkAnimation = {
      [Direction.Up]: new Animation([0, 1, 2, 3], 0.08),
      [Direction.Down]: new Animation([8, 9, 10, 11], 0.08),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.08),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.08),
    };

    // Running animations (used when speed boost is active)
    this.runAnimation = {
      [Direction.Up]: new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.05),
      [Direction.Down]: new Animation([16, 17, 18, 19, 20, 21, 22, 23], 0.05),
      [Direction.Left]: new Animation([24, 25, 26, 27, 28, 29, 30, 31], 0.05),
      [Direction.Right]: new Animation([8, 9, 10, 11, 12, 13, 14, 15], 0.05),
    };

    // Cooldowwn prevents constant direction changes every frame
    this.directionUpdateCooldown = 0;
    this.directionUpdateInterval = 0.2;
  }

  /**
   * Callerd when the enemy enters the chasing state
   */
  enter() {
    this.directionUpdateCooldown = 0;
    this.updateSpeedAndAnimation();
  }

  /**
   * Main update loop for chasing behavior
   */
  update(dt) {
    this.updateSpeedAndAnimation();

    // If target is lost, return to walking or running
    if (!this.enemy.isTargetInRange()) {
      if (this.enemy.speedBoostActive) {
        this.enemy.changeState(EnemyStateName.Running);
      } else {
        this.enemy.changeState(EnemyStateName.Walking);
      }
      return;
    }

    // If chasing a ball and close enough, pick it up
    if (this.enemy.targetType === InteractType.Ball && this.isInPickupRange()) {
      this.pickupBall();
      this.enemy.changeState(EnemyStateName.Idling);
      return;
    }

    // If close enough to attack player or enemy, switch to attack state
    if (
      (this.enemy.targetType === InteractType.Player ||
        this.enemy.targetType === InteractType.Enemy) &&
      this.isInAttackRange()
    ) {
      this.enemy.direction = this.enemy.getDirectionToTarget();
      this.updateCurrentAnimation();
      this.enemy.changeState(EnemyStateName.Attacking);
      return;
    }

    // Reduce direction cooldown timer
    this.directionUpdateCooldown -= dt;

    // Update direction periodically to avoid jittery movement
    if (this.directionUpdateCooldown <= 0) {
      this.enemy.direction = this.enemy.getDirectionToTarget();
      this.updateCurrentAnimation();
      this.directionUpdateCooldown = this.directionUpdateInterval;
    }

    // Move toward the targe
    this.chase(dt);
  }

  /**
   * Updates movement speed and sprite set depending on boost status
   */
  updateSpeedAndAnimation() {
    if (this.enemy.speedBoostActive) {
      this.enemy.speed = EnemyChasingState.SPEED_BOOST;
      this.enemy.sprites = this.enemy.runningSprites;
    } else {
      this.enemy.speed = Enemy.CHASE_SPEED;
      this.enemy.sprites = this.enemy.walkingSprites;
    }
  }

  /**
   * Updates the current animation based on direction and speed
   */
  updateCurrentAnimation() {
    const animationSet = this.enemy.speedBoostActive
      ? this.runAnimation
      : this.walkAnimation;

    this.enemy.currentAnimation = animationSet[this.enemy.direction];
  }

  /**
   * Checks whether the enemy is close enough to attack its target
   */
  isInAttackRange() {
    if (!this.enemy.currentTarget) return false;

    const distance = this.enemy.getDistanceTo(
      this.enemy.currentTarget.position
    );

    return distance <= EnemyChasingState.ATTACK_RANGE;
  }

  /**
   *checks whether the enemy is close enough to pick up a ball
   */
  isInPickupRange() {
    if (
      !this.enemy.currentTarget ||
      this.enemy.targetType !== InteractType.Ball
    )
      return false;

    const distance = this.enemy.getDistanceTo(
      this.enemy.currentTarget.position
    );

    return distance <= EnemyChasingState.PICKUP_RANGE;
  }

  /**
   * Triggers the ball's effect when picked up
   */
  pickupBall() {
    if (this.enemy.currentTarget && !this.enemy.currentTarget.wasConsumed) {
      this.enemy.currentTarget.onConsume(this.enemy);
    }
  }

  /**
   * Moves the enemy toward its target in a single direction
   */
  chase(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newPositionX = this.enemy.position.x;
    let newPositionY = this.enemy.position.y;

    // Movement is restricted to one direction (no diagonals)
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

    // Apply movement if valid, otherwise try alternate path
    if (this.isValidMove(newPositionX, newPositionY)) {
      this.enemy.position.x = newPositionX;
      this.enemy.position.y = newPositionY;
    } else {
      this.tryAlternatePath(dt);
    }
  }

  /**
   * Attemts to move around obstacles by changing direction
   */
  tryAlternatePath(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newPositionX = this.enemy.position.x;
    let newPositionY = this.enemy.position.y;

    // If blocked horizontally, try moving vertically
    if (
      this.enemy.direction === Direction.Left ||
      this.enemy.direction === Direction.Right
    ) {
      const playerCenterY = this.enemy.player.position.y + 16;
      const enemyCenterY = this.enemy.position.y + Enemy.HEIGHT / 2;

      newPositionY += playerCenterY > enemyCenterY ? moveDelta : -moveDelta;
    }
    // If blocked vertically, try moving horizontaly
    else {
      const playerCenterX = this.enemy.player.position.x + 16;
      const enemyCenterX = this.enemy.position.x + Enemy.WIDTH / 2;

      newPositionX += playerCenterX > enemyCenterX ? moveDelta : -moveDelta;
    }

    // Apply alternate movement if valid
    if (this.isValidMove(newPositionX, newPositionY)) {
      this.enemy.position.x = newPositionX;
      this.enemy.position.y = newPositionY;
    }
  }

  /**
   * Validates movement against map boundaries and collision tiless
   */
  isValidMove(positionX, positionY) {
    const mapWidth = this.enemy.map.width * Tile.SIZE;
    const mapHeight = this.enemy.map.height * Tile.SIZE;

    // Prevent leaving map boundaries
    if (positionX < 0 || positionX + Enemy.WIDTH > mapWidth) return false;
    if (positionY < 0 || positionY + Enemy.HEIGHT > mapHeight) return false;

    // check collision layer at enemy's center
    const tileX = Math.floor((positionX + Enemy.WIDTH / 2) / Tile.SIZE);
    const tileY = Math.floor((positionY + Enemy.HEIGHT / 2) / Tile.SIZE);

    return this.enemy.map.collisionLayer.getTile(tileX, tileY) === null;
  }
}
