import PlinkoBoard from "../services/PlinkoMap.js";
import PlinkoBall from "./plinkoball.js";
import {
  context,
  DEBUG,
  matter,
  world,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  input,
  stateMachine,
} from "../globals.js";
import GameStateName from "../enums/GameStateName.js";

const { Body, Composite, Sleeping } = matter;

export default class PlinkoLevel {
  constructor() {
    this.board = new PlinkoBoard();
    this.balls = [];
    this.score = 0;
    this.canDropBall = true;

    const spawnPos = this.board.getSpawnPosition();
    this.spawnY = Math.max(spawnPos.y - 8, 20);

    // Start in the middle
    this.readyBallX = CANVAS_WIDTH / 2;

    this.readyBall = null;
    this.initializeReadyBall();
  }

  initializeReadyBall() {
    const spawnX = this.readyBallX;
    const spawnY = this.spawnY;

    this.readyBall = new PlinkoBall(spawnX, spawnY);
    this.readyBall.isReady = true;

    // Make static and clean
    Body.setStatic(this.readyBall.body, true);
    Body.setVelocity(this.readyBall.body, { x: 0, y: 0 });
    Body.setAngularVelocity(this.readyBall.body, 0);
    Sleeping.set(this.readyBall.body, false);
  }

  update(dt) {
    this.board.update(dt);

    // Move ready ball horizontally (only if it is ready)
    if (this.readyBall?.isReady) {
      this.handleBallPositioning(dt);
    }

    // Update dropped balls
    this.balls.forEach((ball) => ball.update(dt));

    //Clean up balls that fell off screen
    this.balls = this.balls.filter((ball) => !ball.shouldCleanUp);

    // if no ball and no ready ball then spawn a new one
    if (this.balls.length === 0 && !this.readyBall) {
      this.canDropBall = true;
      this.initializeReadyBall();
    }

    // Drop with Enter
    if (input.isKeyPressed("Enter") && this.readyBall && this.canDropBall) {
      this.dropBall();
    }

    if (input.isKeyPressed("Escape")) {
      stateMachine.change(GameStateName.Play);
    }
  }

  /**
   * movee the ready ball left/right.
   */
  handleBallPositioning(dt) {
    if (!this.readyBall?.isReady) return;

    const moveSpeed = 300;
    const minX = 30;
    const maxX = CANVAS_WIDTH - 30;

    if (input.isKeyPressed("a") || input.isKeyPressed("A")) {
      this.readyBallX -= moveSpeed * dt;
    }

    if (input.isKeyPressed("d") || input.isKeyPressed("D")) {
      this.readyBallX += moveSpeed * dt;
    }

    this.readyBallX = Math.max(minX, Math.min(this.readyBallX, maxX));

    Body.setPosition(this.readyBall.body, {
      x: this.readyBallX,
      y: this.spawnY,
    });

    Body.setVelocity(this.readyBall.body, { x: 0, y: 0 });
    Body.setAngularVelocity(this.readyBall.body, 0);
    Sleeping.set(this.readyBall.body, false);
  }

  render() {
    this.board.render();

    if (this.readyBall) {
      this.readyBall.render();
    }

    this.balls.forEach((ball) => ball.render());
  }

  /**
   * this Drops the ready ball.
   */
  dropBall() {
    if (!this.canDropBall || !this.readyBall) return;

    Body.setPosition(this.readyBall.body, {
      x: this.readyBallX,
      y: this.spawnY,
    });

    Body.setStatic(this.readyBall.body, false);
    Sleeping.set(this.readyBall.body, false);

    const randomVelocity = (Math.random() - 0.5) * 2;
    Body.setVelocity(this.readyBall.body, { x: randomVelocity, y: 0 });

    this.readyBall.isReady = false;
    this.readyBall.level = this;

    this.balls.push(this.readyBall);
    this.readyBall = null;

    // cannot drop again until the ball is gone
    this.canDropBall = false;
  }
}
