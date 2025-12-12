import PlinkoPeg from "../objects/plinkopeg.js";
//import PlinkoMultiplier from "../entities/plinkomultiplier.js";
import EventName from "../enums/EventName.js";
import BodyType from "../enums/BodyType.js";
import {
  engine,
  matter,
  world,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  context,
} from "../globals.js";
import Background from "../objects/Background.js";

const { Bodies, Composite, Events } = matter;

export default class PlinkoBoard {
  static GRID_SIZE = 32;

  /**
   * The PlinkoBoard manages pegs and multipliers.
   * Like Fortress.js in Angry Birds - manages game entities and collisions.
   */
  constructor() {
    this.gridCols = Math.ceil(CANVAS_WIDTH / PlinkoBoard.GRID_SIZE);
    this.gridRows = Math.ceil(CANVAS_HEIGHT / PlinkoBoard.GRID_SIZE);

    this.background = new Background();

    this.pegs = [];
    this.createPegs();
    this.registerCollisionEvents();
  }

  update(dt) {
    this.pegs.forEach((peg) => peg.update(dt));
  }

  render() {
    // Perhaps add decore for the bow
    this.pegs.forEach((peg) => peg.render());
  }

  /**
   * Create boundry you know this is chat cuzzz
   */
  createBorders() {
    const wallThickness = 10;

    const walls = [
      Bodies.rectangle(
        -wallThickness / 2,
        CANVAS_HEIGHT / 2,
        wallThickness,
        CANVAS_HEIGHT,
        {
          isStatic: true,
          label: "wall",
          restitution: 0.8,
        }
      ),
      Bodies.rectangle(
        CANVAS_WIDTH + wallThickness / 2,
        CANVAS_HEIGHT / 2,
        wallThickness,
        CANVAS_HEIGHT,
        {
          isStatic: true,
          label: "wall",
          restitution: 0.8,
        }
      ),
      Bodies.rectangle(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT + wallThickness / 2,
        CANVAS_WIDTH,
        wallThickness,
        {
          isStatic: true,
          label: "wall",
        }
      ),
    ];

    Composite.add(world, walls);
  }

  /*
   * This will craete the pegs, where you can configure the placement of the pegs
   */
  createPegs() {
    const pegRows = [
      { row: 0, cols: 7, offset: 0 },
      { row: 2, cols: 7, offset: 1 },
      { row: 4, cols: 7, offset: 0 },
      { row: 6, cols: 7, offset: 1 },
    ];

    pegRows.forEach((config) => {
      const spacing = (this.gridCols - 1) / (config.cols + 1);

      for (let col = 0; col < config.cols; col++) {
        const x =
          PlinkoBoard.GRID_SIZE *
          ((col + 1) * spacing + (config.offset * spacing) / 2);
        const y = PlinkoBoard.GRID_SIZE * (config.row + 3);

        const peg = new PlinkoPeg(x, y);
        this.pegs.push(peg);
      }
    });
  }

  /**
   * Get the spanws balls
   */
  getSpawnPosition() {
    return {
      x: CANVAS_WIDTH / 2,
      y: PlinkoBoard.GRID_SIZE * 1.5,
    };
  }

  /**
   * Register collision events
   */
  registerCollisionEvents() {
    Events.on(engine, EventName.CollisionStart, (event) => {
      this.onCollisionStart(event);
    });
  }

  /**
   * Handle collision start
   */
  onCollisionStart(event) {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      // Ball hits peg
      if (this.isBall(bodyA) && this.isPeg(bodyB)) {
        this.handleBallPegCollision(bodyA, bodyB);
      } else if (this.isBall(bodyB) && this.isPeg(bodyA)) {
        this.handleBallPegCollision(bodyB, bodyA);
      }
    });
  }

  isBall(body) {
    return body.label === BodyType.Bird;
  }

  isPeg(body) {
    return body.label === BodyType.Pig;
  }

  handleBallPegCollision(ballBody, pegBody) {
    if (pegBody.entity) {
      pegBody.entity.flash();
    }
  }
}
