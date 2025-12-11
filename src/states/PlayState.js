import State from "../../lib/State.js";
import Map from "../services/Map.js";
import { input, setCanvasSize, context } from "../globals.js";

/**
 * currently allows to switch between maps this is temporary 
 */
export default class PlayState extends State {
  constructor(mainMapDefinition, plinkoMapDefinition) {
    super();
    this.mainMapDefinition = mainMapDefinition;
    this.plinkoMapDefinition = plinkoMapDefinition;
    
    const onBallConsumed = () => this.switchMap("PlinkoMap");
    
    this.map = new Map(mainMapDefinition, onBallConsumed);
    this.currentMapName = "map";
  }

  //switch to a different map temp
  switchMap(mapName) {
    if (mapName === "map" && this.currentMapName !== "map") {

      context.setTransform(1, 0, 0, 1, 0, 0); //reset canvas transform before switching
      setCanvasSize(1920, 960);
      const onBallConsumed = () => this.switchMap("PlinkoMap");
      this.map = new Map(this.mainMapDefinition, onBallConsumed);
      this.currentMapName = "map";
      console.log("Switched to Main Map");

    } else if (mapName === "PlinkoMap" && this.currentMapName !== "PlinkoMap") {

      context.setTransform(1, 0, 0, 1, 0, 0);
      setCanvasSize(480, 352);
      this.map = new Map(this.plinkoMapDefinition, null);
      this.currentMapName = "PlinkoMap";
      console.log("Switched to Plinko Map");

    }
  }

  update(dt) {
    this.map.update(dt);
    if (input.isKeyPressed('m')) {
      this.switchMap("map");
    }
    if (input.isKeyPressed('p')) {
      this.switchMap("PlinkoMap");
    }
  }

  render() {
    this.map.render();
  }
}