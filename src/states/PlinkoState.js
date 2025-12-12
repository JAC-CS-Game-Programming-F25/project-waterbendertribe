import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import PlinkoLevel from "../objects/PlinkoLevel.js";
import { engine, matter, stateMachine, world } from "../globals.js";

const { Composite, Engine } = matter;

export default class PlinkoState extends State {
  constructor() {
    super();
    // Initialize level in constructor since enter() might not be called
    this.level = new PlinkoLevel();
  }

  enter(parameters = {}) {
    // Reinitialize level on enter
    this.level = new PlinkoLevel();
  }

  exit() {
    // Remove all Matter bodies from world
    Composite.allBodies(world).forEach((body) => Composite.remove(world, body));
  }

  update(dt) {
    /**
     * Update the Matter world one step/frame. By calling it here,
     * we can be sure that the Matter world will be updated at the
     * same rate as our canvas animation.
     */
    Engine.update(engine, dt * 1000);

    if (this.level) {
      this.level.update(dt);
    }
  }

  render() {
    if (this.level) {
      this.level.render();
    }
  }
}
