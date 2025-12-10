import State from "../../lib/State.js";
import Map from "../services/Map.js";
//import Player from "../entities/Player.js";

export default class PlayState extends State {
  constructor(mapDefinition) {
    super();
    this.map = new Map(mapDefinition);
	//this.player = new Player();
  }

  update(dt) {
    this.map.update(dt);
	//this.player.update(dt);
  }

  render(context) {
    this.map.render(context);
	//this.player.render();
  }
}
