import State from "../../lib/State.js";

export default class PlayState extends State {
  constructor() {
    super();
    this.map = new Map(mapDefinition);
    this.player = new Player(50, 150, 16, 24, this.map);
    this.camera = new Camera(
      this.player,
      canvas.width,
      canvas.height,
      this.map.width * Tile.SIZE,
      this.map.height * Tile.SIZE
    );
  }

  update(dt) { 
	
  }
}
