import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import PlinkoLevel from "../objects/PlinkoLevel.js";
import { 
  engine, 
  matter, 
  stateMachine, 
  world, 
  context, 
  setCanvasSize,
  input,
  DEBUG 
} from "../globals.js";

const { Composite, Engine } = matter;

/**
 * Plinko mini game state
 */
export default class PlinkoState extends State {
  constructor() {
    super();
    this.level = null;
  }

  enter(parameters = {}) {

    context.setTransform(1, 0, 0, 1, 0, 0);
    setCanvasSize(480, 352);
    this.level = new PlinkoLevel(this);
  }

  exit() {

    const bodiesToRemove = Composite.allBodies(world);
    bodiesToRemove.forEach((body) => {
      Composite.remove(world, body);
    });
    
    this.level = null;
  }

  /**
   * Return to main map 
   */
  returnToMainMap() {
    stateMachine.change(GameStateName.Play, {
      restoreMap: true 
    });
  }

  /**
   * for map switch for consistency with PlayState interface
   */
  switchMapWithTransition(mapName) {
    if (mapName === "map") {
      this.returnToMainMap();
    }
  }

  update(dt) {
    Engine.update(engine, dt * 1000);

    if (this.level) {
      this.level.update(dt);
    }
    
    if (DEBUG) {
      if (input.isKeyPressed("m")) {
        this.returnToMainMap();
      }
    }
  }

  render() {
    if (this.level) {
      this.level.render();
    }
  }
}