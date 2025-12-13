import PlinkoPeg from "../objects/plinkopeg.js";
import PlinkoBeam from "../objects/PlinkoBeams.js";
import EventName from "../enums/EventName.js";
import BodyType from "../enums/BodyType.js";
import PowerUpFactory from "./PowerUpFactory.js";
import PowerUpType from "../enums/PowerUpType.js";
import PowerUp from "../objects/PowerUps/PowerUp.js";
import {
  engine,
  matter,
  world,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  context,
} from "../globals.js";

const { Bodies, Composite, Events } = matter;

export default class PlinkoBoard {
  static GRID_SIZE = 32;

  /**
   * The PlinkoBoard manages pegs and multipliers.
   * Like Fortress.js in Angry Birds - manages game entities and collisions.
   */
  constructor(playState = null) {
    this.gridCols = Math.ceil(CANVAS_WIDTH / PlinkoBoard.GRID_SIZE);
    this.gridRows = Math.ceil(CANVAS_HEIGHT / PlinkoBoard.GRID_SIZE);
    this.pegs = [];
    this.beams = [];
    this.powerUps = [];
    this.playState = playState;

    this.createPegs();
    this.createBeams();
    this.createPowerUps();
    this.registerCollisionEvents();
  }

  update(dt) {
    this.pegs.forEach((peg) => peg.update(dt));
    this.beams.forEach((beam) => beam.update(dt));
    this.powerUps.forEach((powerUp) => powerUp.update(dt));
    //this.cleanUpPowerUps();
  }

  render() {
    // Perhaps add decore for the bow
    this.beams.forEach((beam) => beam.render());
    this.powerUps.forEach((powerUp) => powerUp.render());
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

  createPegs() {
    const pegRows = [
      { row: -1, cols: 7, offset: 0 },
      { row: 1, cols: 7, offset: 1 },
      { row: 3, cols: 7, offset: 0 },
      { row: 5, cols: 7, offset: 1 },
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

  createPowerUps() {
    const types = [
      PowerUpType.AttackIncrease,
      PowerUpType.SpeedPowerUp,
      PowerUpType.DefencePowerUp
    ];

    // Place power-ups between beams
    if (this.beams.length >= 2) {
      for (let i = 0; i < this.beams.length - 1; i++) {
        const left = this.beams[i];
        const right = this.beams[i +1];
        
        // Calculate desired center position between beams
        const centerX = (left.body.position.x + right.body.position.x) / 2;
        const centerY = Math.min(left.body.position.y, right.body.position.y) - 50;

        // Rectangle constructor expects top-left; convert from center
        const x = centerX - PowerUp.WIDTH / 2;
        const y = centerY - PowerUp.HEIGHT / 2;

        // Cycle through power-up types
        const typeIndex = i % types.length;
        const type = types[typeIndex];

        // Create power-up using factory
        const powerUp = PowerUpFactory.createInstance(type, x, y);
        if (powerUp) {
          powerUp.playState = this.playState;
        }
        
        if (powerUp) {
          this.powerUps.push(powerUp);
        }
      }
    }
  }

  // createBeams() {
  //   const beamCol = [
  //     { row: 7, cols: 4, offset: 0 }
  //   ];

  //   beamCol.forEach((config) => {
  //     const spacing = (this.gridCols - 1) / (config.cols + 1);

  //     for (let col = 0; col < config.cols; col++) {
  //       const x = PlinkoBoard.GRID_SIZE *
  //         ((col + 1) * spacing + (config.offset * spacing) / 2);
  //       const y = PlinkoBoard.GRID_SIZE * (config.row + 3);

  //       const beam = new PlinkoBeam(x, y);
  //       this.beams.push(beam);
  //     }
  //   });
  // }


  createBeams() {
    const beamDisplayed = 4;
    const beamHeight = PlinkoBeam.HEIGHT - 40;
    const y = CANVAS_HEIGHT - beamHeight / 4;
    const spacing = CANVAS_WIDTH / (beamDisplayed + 1);

    for (let i = 0; i < beamDisplayed; i++) {
      const x = spacing * (i + 0.8);
      const beam = new PlinkoBeam(x, y);
      this.beams.push(beam);
    }
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

      // Ball hits power-up
      if (this.isBall(bodyA) && this.isPowerUp(bodyB)) {
        this.handleBallPowerUpCollision(bodyA, bodyB);
      } else if (this.isBall(bodyB) && this.isPowerUp(bodyA)) {
        this.handleBallPowerUpCollision(bodyB, bodyA);
      }
    });
  }

  isBall(body) {
    return body.label === BodyType.CatBall;
  }

  isPowerUp(body) {
    return body.label === BodyType.PowerUp;
  }

  handleBallPowerUpCollision(ballBody, powerUpBody) {
    const powerUpObj = powerUpBody?.entity || powerUpBody?.gameObject;

    if (powerUpObj && typeof powerUpObj.onConsume === "function") {
      powerUpObj.onConsume();
      console.log("Power-up collected!");
    }

    // Remove consumed power-ups
    this.powerUps = this.powerUps.filter((powerUp) => !powerUp.shouldCleanUp);
  }

   cleanUpPowerUps() {
    // Remove consumed power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      if (powerUp.shouldCleanUp) {
        return false;
      }
      return true;
    });
  }
}
