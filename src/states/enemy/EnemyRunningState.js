import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import { timer } from "../../globals.js";
import Enemy from "../../entities/Enemy.js";

export default class EnemyRunningState extends State {
  // Duration range for running before switchin behavior
  static WALK_DURATION_MIN = 2;
  static WALK_DURATION_MAX = 5;

  //chance to stop and idle after running
  static IDLE_CHANCE = 0.3;

  // Movement speed while running
  static MOVE_SPEED = 200;

  /**
   *gandles enemy behavior when running at high speed
   */
  constructor(enemy) {
    super();
    this.enemy = enemy;

    // Running animations for all directions
    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.05),
      [Direction.Down]: new Animation([16, 17, 18, 19, 20, 21, 22, 23], 0.05),
      [Direction.Left]: new Animation([24, 25, 26, 27, 28, 29, 30, 31], 0.05),
      [Direction.Right]: new Animation([8, 9, 10, 11, 12, 13, 14, 15], 0.05),
    };
  }

  /**
   * Called when the enemy enters the running state
   */
  enter() {
    // Running always uses running sprites and high speed
    this.enemy.sprites = this.enemy.runningSprites;
    this.enemy.speed = EnemyRunningState.MOVE_SPEED;

    this.enemy.currentAnimation = this.animation[this.enemy.direction];

    // Choose how long the enemy will keep running
    this.walkDuration = this.getRandomDuration(
      EnemyRunningState.WALK_DURATION_MIN,
      EnemyRunningState.WALK_DURATION_MAX
    );

    this.startTimer();
  }

  /**
   * Runs every frame while the enemy is running
   */
  update(dt) {
    // If speed boost ends, return to walking behavior
    if (!this.enemy.speedBoostActive) {
      this.enemy.changeState(EnemyStateName.Walking);
      return;
    }

    // If a valid target appears, start chasing
    if (this.enemy.isTargetInRange()) {
      this.enemy.changeState(EnemyStateName.Chasing);
      return;
    }

    this.move(dt);
  }

  /**
   * Controls how long the enemy stays in the running state
   */
  async startTimer() {
    await timer.wait(this.walkDuration);

    // Only change state if still running
    if (this.enemy.stateMachine.currentState === this) {
      if (Math.random() < EnemyRunningState.IDLE_CHANCE) {
        this.enemy.changeState(EnemyStateName.Idling);
      } else {
        // Pick a new direction and keep running
        this.chooseRandomDirection();
        this.enemy.currentAnimation = this.animation[this.enemy.direction];

        this.walkDuration = this.getRandomDuration(
          EnemyRunningState.WALK_DURATION_MIN,
          EnemyRunningState.WALK_DURATION_MAX
        );

        this.startTimer();
      }
    }
  }

  /**
   * Chooses a random movement direction
   */
  chooseRandomDirection() {
    const directions = [
      Direction.Up,
      Direction.Down,
      Direction.Left,
      Direction.Right,
    ];

    this.enemy.direction =
      directions[Math.floor(Math.random() * directions.length)];
  }

  /**
   * Moves the enemy in the current direction
   */
  move(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newpositionX = this.enemy.position.x;
    let newpositionY = this.enemy.position.y;

    // Movement happens in one direction only
    switch (this.enemy.direction) {
      case Direction.Up:
        newpositionY -= moveDelta;
        break;
      case Direction.Down:
        newpositionY += moveDelta;
        break;
      case Direction.Left:
        newpositionX -= moveDelta;
        break;
      case Direction.Right:
        newpositionX += moveDelta;
        break;
    }

    // Apply movement if valid, otherwise change direction
    if (this.isValidMove(newpositionX, newpositionY)) {
      this.enemy.position.x = newpositionX;
      this.enemy.position.y = newpositionY;
    } else {
      // Hit a wall, choose a new direction
      this.chooseRandomDirection();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
    }
  }

  /**
   * Checks if a movement position is inside the map and not blocked
   */
  isValidMove(positionX, positionY) {
    const mapWidth = this.enemy.map.width * Tile.SIZE;
    const mapHeight = this.enemy.map.height * Tile.SIZE;

    // Prevent leaving the map
    if (positionX < 0 || positionX + Enemy.WIDTH > mapWidth) return false;
    if (positionY < 0 || positionY + Enemy.HEIGHT > mapHeight) return false;

    // Check collision tile under enemy center
    const tileX = Math.floor((positionX + Enemy.WIDTH / 2) / Tile.SIZE);
    const tileY = Math.floor((positionY + Enemy.HEIGHT / 2) / Tile.SIZE);

    return this.enemy.map.collisionLayer.getTile(tileX, tileY) === null;
  }

  /**
   * Returns a random number between the given range
   */
  getRandomDuration(min, max) {
    return Math.random() * (max - min) + min;
  }
}
