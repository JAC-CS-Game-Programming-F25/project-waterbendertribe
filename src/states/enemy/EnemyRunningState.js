import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import { timer } from "../../globals.js";
import Enemy from "../../entities/Enemy.js";

export default class EnemyRunningState extends State {
  static WALK_DURATION_MIN = 2;
  static WALK_DURATION_MAX = 5;
  static IDLE_CHANCE = 0.3; // 30% chance to go idle after Running
  static MOVE_SPEED = 200;

  constructor(enemy) {
    super();
    this.enemy = enemy;

    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.05),
      [Direction.Down]: new Animation([16, 17, 18, 19, 20, 21, 22, 23], 0.05),
      [Direction.Left]: new Animation([24, 25, 26, 27, 28, 29, 30, 31], 0.05),
      [Direction.Right]: new Animation([8, 9, 10, 11, 12, 13, 14, 15], 0.05),
    };
  }

  enter() {
    // ✅ RULE: Running uses running sprites and high speed
    this.enemy.sprites = this.enemy.runningSprites;
    this.enemy.speed = EnemyRunningState.MOVE_SPEED;

    this.enemy.currentAnimation = this.animation[this.enemy.direction];

    this.walkDuration = this.getRandomDuration(
      EnemyRunningState.WALK_DURATION_MIN,
      EnemyRunningState.WALK_DURATION_MAX
    );

    this.startTimer();
  }

  update(dt) {
    // ✅ CRITICAL: If speed boost ended while running, switch to Walking
    if (!this.enemy.speedBoostActive) {
      this.enemy.changeState(EnemyStateName.Walking);
      return;
    }

    // ✅ Check if any target (player, enemy, ball) is in range - switch to chasing
    if (this.enemy.isTargetInRange()) {
      this.enemy.changeState(EnemyStateName.Chasing);
      return;
    }

    this.move(dt);
  }

  async startTimer() {
    await timer.wait(this.walkDuration);

    // After Running, maybe go idle or keep Running
    if (this.enemy.stateMachine.currentState === this) {
      if (Math.random() < EnemyRunningState.IDLE_CHANCE) {
        this.enemy.changeState(EnemyStateName.Idling);
      } else {
        // Change direction and keep Running
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

  move(dt) {
    const moveDelta = this.enemy.speed * dt;
    let newpositionX = this.enemy.position.x;
    let newpositionY = this.enemy.position.y;

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

    // Check map boundaries and collisions
    if (this.isValidMove(newpositionX, newpositionY)) {
      this.enemy.position.x = newpositionX;
      this.enemy.position.y = newpositionY;
    } else {
      // Hit a wall - choose new direction
      this.chooseRandomDirection();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
    }
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

  getRandomDuration(min, max) {
    return Math.random() * (max - min) + min;
  }
}
