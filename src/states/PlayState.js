import State from "../../lib/State.js";
import Map from "../services/Map.js";
import { input, setCanvasSize } from "../globals.js";
//import Player from "../entities/Player.js";

/**
 * currently allows to switch between maps this is temporary 
 */
export default class PlayState extends State {
  constructor(mainMapDefinition, plinkoMapDefinition) {
    super();
    this.mainMapDefinition = mainMapDefinition;
    this.plinkoMapDefinition = plinkoMapDefinition;
    
    this.map = new Map(mainMapDefinition);
    this.currentMapName = "map";
  }

  //switch to a different map temp
  switchMap(mapName) {
    if (mapName === "map" && this.currentMapName !== "map") {

      this.map = new Map(this.mainMapDefinition);
      this.currentMapName = "map";
      setCanvasSize(1920, 960); 
      console.log("Switched to Main Map");

    } else if (mapName === "PlinkoMap" && this.currentMapName !== "PlinkoMap") {

      this.map = new Map(this.plinkoMapDefinition);
      this.currentMapName = "PlinkoMap";
      setCanvasSize(480, 352); 
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


// export default class PlayState extends State {
//   constructor(mapDefinition) {
//     super();
//     this.map = new Map(mapDefinition);
// 	//this.player = new Player();
//   }

//   update(dt) {
//     this.map.update(dt);
// 	//this.player.update(dt);
//   }

//   render() {
//     this.map.render();
//   }
// }