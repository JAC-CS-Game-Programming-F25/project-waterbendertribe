import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import { timer } from "../../globals.js";
import Enemy from "../../entities/Enemy.js";

export default class EnemyWalkingState extends State {
  // Duration range for walking before switching behavioe
  static WALK_DURATION_MIN = 2;
  static WALK_DURATION_MAX = 5;

  // Chance to stop and idle after walking
  static IDLE_CHANCE = 0.3;

  /**
   * Handles enemy behavior when wandering around the map
   */
  constructor(enemy) {
    super();
    this.enemy = enemy;

    // Walking animations for each direction
    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3], 0.15),
      [Direction.Down]: new Animation([8, 9, 10, 11], 0.15),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.15),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.15),
    };
  }

  /**
   * Called when the enemy enters the walking state
   */
  enter() {
    // Walking uses slower wander speedd
    this.enemy.speed = Enemy.WANDER_SPEED;

    // Use walking sprite set
    this.enemy.sprites = this.enemy.walkingSprites;

    //pick an initial random direction
    this.chooseRandomDirection();
    this.enemy.currentAnimation = this.animation[this.enemy.direction];

    // Decide how long the enemy will walk
    this.walkDuration = this.getRandomDuration(
      EnemyWalkingState.WALK_DURATION_MIN,
      EnemyWalkingState.WALK_DURATION_MAX
    );

    this.startTimer();
  }

  /**
   * Runs every frame while the enemy is walking
   */
  update(dt) {
    // If speed boost activates, switch to running
    if (this.enemy.speedBoostActive) {
      this.enemy.changeState(EnemyStateName.Running);
      return;
    }

    // If a target appears, begin chasing
    if (this.enemy.isTargetInRange()) {
      this.enemy.changeState(EnemyStateName.Chasing);
      return;
    }

    this.move(dt);
  }

  /**
   * Controls how long the enemy keeps walking
   */
  async startTimer() {
    await timer.wait(this.walkDuration);

    // Only change state if still walking
    if (this.enemy.stateMachine.currentState === this) {
      if (Math.random() < EnemyWalkingState.IDLE_CHANCE) {
        this.enemy.changeState(EnemyStateName.Idling);
      } else {
        // Pick a new direction and continue walking
        this.chooseRandomDirection();
        this.enemy.currentAnimation = this.animation[this.enemy.direction];

        this.walkDuration = this.getRandomDuration(
          EnemyWalkingState.WALK_DURATION_MIN,
          EnemyWalkingState.WALK_DURATION_MAX
        );

        this.startTimer();
      }
    }
  }

  /**
   * Chooses a random direction for movement
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
   * Moves the enemy based on the current direction
   */
  move(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newpositionX = this.enemy.position.x;
    let newpositionY = this.enemy.position.y;

    // Apply movement in one direction only
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
   * Checks if the movement stays inside the map and avoids collisions
   */
  isValidMove(positionX, positionY) {
    const mapWidth = this.enemy.map.width * Tile.SIZE;
    const mapHeight = this.enemy.map.height * Tile.SIZE;

    // Prevent leaving map boundaries
    if (positionX < 0 || positionX + Enemy.WIDTH > mapWidth) return false;
    if (positionY < 0 || positionY + Enemy.HEIGHT > mapHeight) return false;

    // Check collision tile under enemy center
    const tileX = Math.floor((positionX + Enemy.WIDTH / 2) / Tile.SIZE);
    const tileY = Math.floor((positionY + Enemy.HEIGHT / 2) / Tile.SIZE);

    return this.enemy.map.collisionLayer.getTile(tileX, tileY) === null;
  }

  /**
   * Returns a random value within the given range
   */
  getRandomDuration(min, max) {
    return Math.random() * (max - min) + min;
  }
}
