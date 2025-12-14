import State from "../../lib/State.js";
import Map from "../services/Map.js";
import { input, setCanvasSize, context, stateMachine, DEBUG, sounds } from "../globals.js";
import SaveManager from "../services/SaveManager.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from '../enums/SoundName.js';

/**
 * Main play state
 */
export default class PlayState extends State {
  constructor(mainMapDefinition) {
    super();
    this.mainMapDefinition = mainMapDefinition;
    this.map = null;
  }

  enter(parameters = {}) {

    context.setTransform(1, 0, 0, 1, 0, 0);
    setCanvasSize(1920, 960);
    
    if (parameters.restoreMap && this.map) {
      console.log("Restored Main Map with existing state");
    } else {
      //create new map
      this.map = new Map(this.mainMapDefinition, this);
      this.map.wins = SaveManager.loadWins();
      console.log("Created new Main Map");
    }
  }

  exit() {
    console.log("Exiting Main Map");
  }

  /**
   * go to Plinko state
   */
  goToPlinko() {
    stateMachine.change(GameStateName.Transition, {
      fromState: this,
      toState: stateMachine.states[GameStateName.Plinko],
    });
  }

  /**
   * Reset the main map 
   */
  resetMap() {
    const savedWins = this.map?.wins ?? 0;
    this.map = new Map(this.mainMapDefinition, this);
    this.map.wins = savedWins;
  }

  update(dt) {
    sounds.play(SoundName.Panem);
    
    if (this.map) {
      this.map.update(dt);
    }
  
    if (DEBUG) {
      if (input.isKeyPressed("p")) {
        this.goToPlinko();
      }
    }
   
    this.checkWinOrLose();
  }

  render() {
    if (this.map) {
      this.map.render();
    }
  }

  checkWinOrLose() {
    if (this.map) {
      if (this.map.didWin()) {
        stateMachine.change(GameStateName.Transition, {
          fromState: this,
          toState: stateMachine.states[GameStateName.Victory],
        });
      } else if (this.map.didLose()) {
        stateMachine.change(GameStateName.Transition, {
          fromState: this,
          toState: stateMachine.states[GameStateName.GameOver],
        });
      }
    }
  }
}