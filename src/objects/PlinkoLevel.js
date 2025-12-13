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
import Background from "./Background.js";

const { Body, Composite, Sleeping } = matter;

export default class PlinkoLevel {
  constructor(playState = null) {
    this.playState = playState;
    this.board = new PlinkoBoard(playState);
    this.background = new Background();
    
    this.balls = [];
    this.score = 0;
    this.canDropBall = true;

    this.spawnY = 20;

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
    this.background.render();
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



// import PlinkoBoard from "../services/PlinkoMap.js";
// import PlinkoBall from "./plinkoball.js";
// import {
//   canvas,
//   context,
//   DEBUG,
//   matter,
//   world,
//   CANVAS_WIDTH,
//   CANVAS_HEIGHT,
//   input,
//   stateMachine,
//   engine,
// } from "../globals.js";
// import GameStateName from "../enums/GameStateName.js";
// import Background from "./Background.js";
// import BodyType from "../enums/BodyType.js";
// import EventName from "../enums/EventName.js";

// const { Body, Composite, Sleeping, Mouse, MouseConstraint, Events } = matter;

// export default class PlinkoLevel {
//   constructor() {
//     this.board = new PlinkoBoard();
//     this.background = new Background();
    
//     this.balls = [];
//     this.score = 0;
//     this.canDropBall = true;

//     const spawnPos = this.board.getSpawnPosition();
//     this.spawnY = Math.max(spawnPos.y - 8, 20);

//     // Start in the middle
//     this.readyBallX = CANVAS_WIDTH / 2;

//     this.readyBall = null;
//     this.isDragging = false;
//     this.mouseWasReleased = false;
    
//     this.initializeReadyBall();
//     this.initializeMouseConstraint();
//   }

//   initializeReadyBall() {
//     const spawnX = this.readyBallX;
//     const spawnY = this.spawnY;

//     this.readyBall = new PlinkoBall(spawnX, spawnY);
//     this.readyBall.isReady = true;

//     // Make static so it doesn't fall
//     Body.setStatic(this.readyBall.body, true);
//     Body.setVelocity(this.readyBall.body, { x: 0, y: 0 });
//     Body.setAngularVelocity(this.readyBall.body, 0);
//     Sleeping.set(this.readyBall.body, false);
//   }

//   /**
//    * Initialize mouse constraint for dragging the ball
//    */
//   initializeMouseConstraint() {
//     this.mouseWasReleased = false;
//     this.mouse = Mouse.create(canvas);
//     const mouseConstraint = MouseConstraint.create(engine, {
//       mouse: this.mouse,
//       constraint: {
//         stiffness: 0.2,
//         render: { visible: false }
//       }
//     });

//     Composite.add(world, mouseConstraint);
//     this.registerMouseEvents(mouseConstraint);
//   }

//   /**
//    * Register mouse drag events
//    */
//   registerMouseEvents(mouseConstraint) {
//     Events.on(mouseConstraint, EventName.MouseDragStart, (event) => {
//       this.onMouseDragStart(event);
//     });

//     Events.on(mouseConstraint, EventName.MouseDragEnd, (event) => {
//       this.onMouseDragEnd(event);
//     });
//   }

//   onMouseDragStart(event) {
//     // Check if we're dragging the ready ball
//     if (event.body && event.body.label === BodyType.CatBall && this.readyBall?.isReady) {
//       this.isDragging = true;
//       this.mouseWasReleased = false;
      
//       // Keep ball static while dragging
//       Body.setStatic(event.body, true);
//     }
//   }

//   onMouseDragEnd(event) {
//     // Check if we're releasing the ready ball
//     if (event.body && event.body.label === BodyType.CatBall && this.readyBall?.isReady) {
//       this.isDragging = false;
//       this.mouseWasReleased = true;
      
//       // Auto-drop when released
//       if (this.canDropBall) {
//         this.dropBall();
//       }
//     }
//   }

//   update(dt) {
//     this.board.update(dt);

//     // Update ready ball position if being dragged
//     if (this.readyBall?.isReady && this.isDragging) {
//       // Constrain to horizontal movement only at spawn Y
//       const minX = 30;
//       const maxX = CANVAS_WIDTH - 30;
//       const constrainedX = Math.max(minX, Math.min(this.readyBall.body.position.x, maxX));
      
//       Body.setPosition(this.readyBall.body, {
//         x: constrainedX,
//         y: this.spawnY
//       });
      
//       this.readyBallX = constrainedX;
//     }

//     // Update dropped balls
//     this.balls.forEach((ball) => ball.update(dt));

//     // Clean up balls that fell off screen
//     this.balls = this.balls.filter((ball) => !ball.shouldCleanUp);

//     // Spawn new ball if all balls are gone
//     if (this.balls.length === 0 && !this.readyBall) {
//       this.canDropBall = true;
//       this.initializeReadyBall();
//     }

//     // Manual drop with Enter (alternative to dragging)
//     if (input.isKeyPressed("Enter") && this.readyBall && this.canDropBall && !this.isDragging) {
//       this.dropBall();
//     }

//     if (input.isKeyPressed("Escape")) {
//       stateMachine.change(GameStateName.Play);
//     }
//   }

//   render() {
//     this.background.render();
//     this.board.render();

//     if (this.readyBall) {
//       this.readyBall.render();
      
//       // Draw instruction text
//       if (this.readyBall.isReady) {
//         context.save();
//         context.fillStyle = 'white';
//         context.strokeStyle = 'black';
//         context.lineWidth = 3;
//         context.font = 'bold 16px Arial';
//         context.textAlign = 'center';
        
//         const text = this.isDragging ? 'Release to Drop!' : 'Drag to Position (or ENTER)';
//         context.strokeText(text, CANVAS_WIDTH / 2, 30);
//         context.fillText(text, CANVAS_WIDTH / 2, 30);
        
//         context.restore();
//       }
//     }

//     this.balls.forEach((ball) => ball.render());
    
//     // Draw score
//     context.save();
//     context.fillStyle = 'white';
//     context.font = 'bold 20px Arial';
//     context.textAlign = 'right';
//     context.fillText(`Score: ${this.score}`, CANVAS_WIDTH - 20, 30);
//     context.restore();
//   }

//   dropBall() {
//     if (!this.canDropBall || !this.readyBall) return;

//     // Set final position
//     Body.setPosition(this.readyBall.body, {
//       x: this.readyBallX,
//       y: this.spawnY,
//     });

//     // Make dynamic (can fall)
//     Body.setStatic(this.readyBall.body, false);
//     Sleeping.set(this.readyBall.body, false);

//     // Add slight random horizontal velocity
//     const randomVelocity = (Math.random() - 0.5) * 2;
//     Body.setVelocity(this.readyBall.body, { x: randomVelocity, y: 0 });

//     this.readyBall.isReady = false;
//     this.readyBall.level = this;

//     this.balls.push(this.readyBall);
//     this.readyBall = null;

//     // Cannot drop again until ball is gone
//     this.canDropBall = false;
//     this.isDragging = false;
//     this.mouseWasReleased = false;
//   }
// }
