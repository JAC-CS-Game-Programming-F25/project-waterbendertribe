import State from "../../lib/State.js";
import Map from "../services/Map.js";
import PlinkoBoard from "../services/PlinkoMap.js";
import { input, setCanvasSize, context, stateMachine, DEBUG, sounds} from "../globals.js";
import SaveManager from "../services/SaveManager.js";
import GameStateName from "../enums/GameStateName.js";
import PlinkoLevel from "../objects/PlinkoLevel.js";
import PlinkoState from "./PlinkoState.js";
import SoundName from '../enums/SoundName.js';

/**
 * currently allows to switch between maps this is temporary
 */
export default class PlayState extends State {
  constructor(mainMapDefinition, plinkoMapDefinition) {
    super();
    this.mainMapDefinition = mainMapDefinition;
    this.plinkoMapDefinition = plinkoMapDefinition;

    // Create the main map once and keep it alive to preserve state (e.g., balls)
    this.mainMap = new Map(this.mainMapDefinition, this);
    this.mainMap.wins = SaveManager.loadWins();
    this.map = this.mainMap;
    this.currentMapName = "map";
  }

  enter(parameters = {}) {
    if (parameters.targetMap) {
      this.switchMap(parameters.targetMap);
    }
  }

  resetMainMap() {
    const savedWins = this.mainMap?.wins ?? 0;
    this.mainMap = new Map(this.mainMapDefinition, this);
    this.mainMap.wins = savedWins;
    context.setTransform(1, 0, 0, 1, 0, 0);
    setCanvasSize(1920, 960);
    this.map = this.mainMap;
    this.currentMapName = "map";
  }

  //switch to a different map temp
  switchMap(mapName) {
    if (mapName === "map" && this.currentMapName !== "map") {
      context.setTransform(1, 0, 0, 1, 0, 0); //reset canvas transform before switching
      setCanvasSize(1920, 960);
      //keep the existing main map instance to keep prior balls and state
      this.map = this.mainMap;
      this.currentMapName = "map";
      console.log("Switched to Main Map");
      
    } else if (mapName === "PlinkoMap" && this.currentMapName !== "PlinkoMap") {
      context.setTransform(1, 0, 0, 1, 0, 0);
      setCanvasSize(480, 352);
      this.map = new PlinkoState(this);
      this.currentMapName = "PlinkoMap";
      console.log("Switched to Plinko Map");
    }
  }

  switchMapWithTransition(mapName) {
    stateMachine.change(GameStateName.Transition, {
      fromState: this,
      toState: this,
      toStateEnterParameters: { targetMap: mapName },
    });
  }

  update(dt) {
    sounds.play(SoundName.Panem);
    this.map.update(dt);
    if(DEBUG){
      if (input.isKeyPressed("m")) {
            this.switchMap("map");
          }
        if (input.isKeyPressed("p")) {
            this.switchMap("PlinkoMap");
          }
    }
   
    this.checkWinOrLose();
  }

  render() {
    this.map.render();
  }

  checkWinOrLose() {
    if (this.currentMapName === "map" && this.mainMap) {
    if (this.mainMap.didWin()) {
      stateMachine.change(GameStateName.Transition, {
        fromState: this,
        toState: stateMachine.states[GameStateName.Victory],
      });
    } else if (this.mainMap.didLose()) {
      stateMachine.change(GameStateName.Transition, {
        fromState: this,
        toState: stateMachine.states[GameStateName.GameOver],
      });
    }
  }
}
}

