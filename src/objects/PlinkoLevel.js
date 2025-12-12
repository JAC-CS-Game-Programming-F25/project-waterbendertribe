import PlinkoBoard from "../services/PlinkoMap.js";
//import PlinkoBackground from "./PlinkoBackground.js";
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

export default class PlinkoLevel {
  /**
   * The PlinkoLevel contains all the pieces to play Plinko.
   * Like Level.js in Angry Birds - contains Background, Board, and manages game pieces.
   */
  constructor() {
    //this.background = new PlinkoBackground();
    this.board = new PlinkoBoard();
    this.balls = [];
    this.score = 0;
    this.canDropBall = true;
  }

  update(dt) {
    this.board.update(dt);

    // Update all balls
    this.balls.forEach((ball) => ball.update(dt));

    // Clean up balls
    this.balls = this.balls.filter((ball) => !ball.shouldCleanUp);

    // Handle input
    if (input.isKeyPressed("Space") || input.isKeyPressed("Enter")) {
      this.dropBall();
    }

    if (input.isKeyPressed("Escape")) {
      stateMachine.change(GameStateName.Play);
    }
  }

  render() {
    //this.background.render();
    this.renderStatistics();
    this.board.render();

    // Render balls
    this.balls.forEach((ball) => ball.render());

    this.renderControls();
  }

  renderStatistics() {
    context.fillStyle = "white";
    context.font = "bold 30px Arial";
    context.textAlign = "left";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeText(`Score: ${this.score}`, 20, 40);
    context.fillText(`Score: ${this.score}`, 20, 40);

    if (DEBUG) {
      context.font = "20px Arial";
      context.strokeText(`Balls: ${this.balls.length}`, 20, 70);
      context.fillText(`Balls: ${this.balls.length}`, 20, 70);

      context.strokeText(`Pegs: ${this.board.pegs.length}`, 20, 100);
      context.fillText(`Pegs: ${this.board.pegs.length}`, 20, 100);

      context.strokeText(
        `Bodies: ${matter.Composite.allBodies(world).length}`,
        20,
        130
      );
      context.fillText(
        `Bodies: ${matter.Composite.allBodies(world).length}`,
        20,
        130
      );
    }
  }

  renderControls() {
    context.save();
    context.fillStyle = "white";
    context.font = "18px Arial";
    context.textAlign = "center";
    context.strokeStyle = "black";
    context.lineWidth = 2;

    const text = "Press SPACE to drop ball | ESC to exit";
    context.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
    context.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);

    context.restore();
  }

  /**
   * Drop a new ball from spawn position
   */
  dropBall() {
    if (!this.canDropBall) return;

    const spawnPos = this.board.getSpawnPosition();
    const randomX = spawnPos.x + (Math.random() - 0.5) * 20;
    const ball = new PlinkoBall(randomX, spawnPos.y);

    // Store reference so board can call back
    ball.level = this;

    this.balls.push(ball);

    // Cooldown
    this.canDropBall = false;
    setTimeout(() => {
      this.canDropBall = true;
    }, 500);
  }

  /**
   * Called by PlinkoBoard when ball hits multiplier
   */
  addScore(multiplier, powerUpType) {
    const points = Math.round(100 * multiplier);
    this.score += points;

    console.log(`+${points} points! Total: ${this.score}`);
    if (powerUpType) {
      console.log(`Collected ${powerUpType}!`);
    }
  }
}
