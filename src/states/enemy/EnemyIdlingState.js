import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import { timer } from "../../globals.js";

export default class EnemyIdlingState extends State {
  // Minimum and maximum time the enemy stays idle
  static IDLE_DURATION_MIN = 1;
  static IDLE_DURATION_MAX = 3;

  /**
   * Handles behavior when the enemy is standing still
   */
  constructor(enemy) {
    super();
    this.enemy = enemy;

    // Single-frame idle animations for each direction
    this.animation = {
      [Direction.Up]: new Animation([0], 1),
      [Direction.Down]: new Animation([8], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  /**
   * Called when the enemy enters the idle state
   */
  enter() {
    // Use walking sprites while idle
    this.enemy.sprites = this.enemy.walkingSprites;
    this.enemy.currentAnimation = this.animation[this.enemy.direction];

    // Pick a random idle duration
    this.idleDuration = this.getRandomDuration(
      EnemyIdlingState.IDLE_DURATION_MIN,
      EnemyIdlingState.IDLE_DURATION_MAX
    );

    // Start idle timer
    this.startTimer();
  }

  /**
   * Runs every frame while the enemy is idle
   */
  update(dt) {
    // If a valid target appears, immediately start chasing
    if (this.enemy.isTargetInRange()) {
      this.enemy.changeState(EnemyStateName.Chasing);
      return;
    }
  }

  /**
   * Waits for the idle duration, then switches to movement
   */
  async startTimer() {
    await timer.wait(this.idleDuration);

    // Ensure the enemy is still idling before switching states
    if (this.enemy.stateMachine.currentState === this) {
      if (this.enemy.speedBoostActive) {
        this.enemy.changeState(EnemyStateName.Running);
      } else {
        this.enemy.changeState(EnemyStateName.Walking);
      }
    }
  }

  /**
   * Returns a random value between the given range
   */
  getRandomDuration(min, max) {
    return Math.random() * (max - min) + min;
  }
}
