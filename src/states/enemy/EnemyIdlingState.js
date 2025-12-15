import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import { timer } from "../../globals.js";

export default class EnemyIdlingState extends State {
  static IDLE_DURATION_MIN = 1;
  static IDLE_DURATION_MAX = 3;

  constructor(enemy) {
    super();
    this.enemy = enemy;

    this.animation = {
      [Direction.Up]: new Animation([0], 1),
      [Direction.Down]: new Animation([8], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  enter() {
    this.enemy.sprites = this.enemy.walkingSprites;
    this.enemy.currentAnimation = this.animation[this.enemy.direction];

    this.idleDuration = this.getRandomDuration(
      EnemyIdlingState.IDLE_DURATION_MIN,
      EnemyIdlingState.IDLE_DURATION_MAX
    );

    this.startTimer();
  }

  update(dt) {
    // Check if target is in range - switch to chasing
    if (this.enemy.isTargetInRange()) {
      this.enemy.changeState(EnemyStateName.Chasing);
      return;
    }
  }

  async startTimer() {
    await timer.wait(this.idleDuration);

    if (this.enemy.stateMachine.currentState === this) {
      if (this.enemy.speedBoostActive) {
        this.enemy.changeState(EnemyStateName.Running);
      } else {
        this.enemy.changeState(EnemyStateName.Walking);
      }
    }
  }

  getRandomDuration(min, max) {
    return Math.random() * (max - min) + min;
  }
}
