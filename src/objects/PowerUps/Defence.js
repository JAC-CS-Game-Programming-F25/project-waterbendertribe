import Sprite from "../../../lib/Sprite.js";
import Vector from "../../../lib/Vector.js";
// import GameObject from "./GameObject.js";
import { images } from "../../globals.js";
import ImageName from "../../enums/ImageName.js";
// import Hitbox from '../../lib/Hitbox.js';
import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";

export default class DefencePowerUp extends PowerUp {
	static SPRITE_MEASUREMENTS = [{ x: 64, y: 0, width: 32, height: 32}];

	constructor(x, y) {
		super(x, y);

		const spriteSheet = "power_up_sheet";
		this.sprites = GameMatter.generateSprites(DefencePowerUp.SPRITE_MEASUREMENTS, spriteSheet);
		// Center sprite based on its own frame size
		// const w = DefencePowerUp.SPRITE_MEASUREMENTS[0].width;
		// const h = DefencePowerUp.SPRITE_MEASUREMENTS[0].height;
		//  this.renderOffset = { x: -w , y: -h  };
		
	}

}
