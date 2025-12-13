import Sprite from "../../../lib/Sprite.js";
import Vector from "../../../lib/Vector.js";
// import GameObject from "./GameObject.js";
import { images } from "../../globals.js";
import ImageName from "../../enums/ImageName.js";
// import Hitbox from '../../lib/Hitbox.js';
import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";
import { timer } from "../../globals.js";

export default class DefencePowerUp extends PowerUp {
	static SPRITE_MEASUREMENTS = [{ x: 64, y: 0, width: 32, height: 32}];

	constructor(x, y) {
		super(x, y);

		const spriteSheet = "power_up_sheet";
		this.sprites = GameMatter.generateSprites(DefencePowerUp.SPRITE_MEASUREMENTS, spriteSheet);	
	}

  onConsume() {

    if (this.playState && this.playState.mainMap && this.playState.mainMap.player) {
      const player = this.playState.mainMap.player;

      player.defense += 1;

      timer.addTask(
        () => {},
        0,
        10,
        () => {
          player.defense = Math.max(0, player.defense - 1);
        }
      );
    }

    super.onConsume();
  }

}
