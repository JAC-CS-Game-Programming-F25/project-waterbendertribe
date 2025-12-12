import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Tile from "../../services/Tile.js";
import { timer } from "../../globals.js";

export default class EnemyWalkingState extends State {
  static WALK_DURATION_MIN = 2;
  static WALK_DURATION_MAX = 5;
  static IDLE_CHANCE = 0.3; // 30% chance to go idle after walking

  constructor(enemy) {
    super();
    this.enemy = enemy;

    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3], 0.15),
      [Direction.Down]: new Animation([8, 9, 10, 11], 0.15),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.15),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.15),
    };
  }

  enter() {
    this.enemy.speed = this.enemy.constructor.WANDER_SPEED;
    this.chooseRandomDirection();
    this.enemy.currentAnimation = this.animation[this.enemy.direction];

    this.walkDuration = this.getRandomDuration(
      EnemyWalkingState.WALK_DURATION_MIN,
      EnemyWalkingState.WALK_DURATION_MAX
    );

    this.startTimer();
  }

  update(dt) {
    // Check if player is in range - switch to chasing
    if (this.enemy.isPlayerInRange()) {
      this.enemy.changeState(EnemyStateName.Chasing);
      return;
    }

    this.move(dt);
  }

  async startTimer() {
    await timer.wait(this.walkDuration);

    // After walking, maybe go idle or keep walking
    if (this.enemy.stateMachine.currentState === this) {
      if (Math.random() < EnemyWalkingState.IDLE_CHANCE) {
        this.enemy.changeState(EnemyStateName.Idling);
      } else {
        // Change direction and keep walking
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
    let newCanvasX = this.enemy.canvasPosition.x;
    let newCanvasY = this.enemy.canvasPosition.y;

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
      // Hit a wall - choose new direction
      this.chooseRandomDirection();
      this.enemy.currentAnimation = this.animation[this.enemy.direction];
    }
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

  getRandomDuration(min, max) {
    return Math.random() * (max - min) + min;
  }
}
