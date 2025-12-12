import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import GameObject from "./GameObject.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import Hitbox from '../../lib/Hitbox.js';

export default class DefencePowerUp extends GameObject {
	static WIDTH = 32;
	static HEIGHT = 32;

	constructor(position, map = null) {
		super(
			new Vector(DefencePowerUp.WIDTH, DefencePowerUp.HEIGHT),
			position
		);
		
		this.map = map;

		this.sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.DefencePowerUp),
			DefencePowerUp.WIDTH,
			DefencePowerUp.HEIGHT
		);

		this.hitboxOffsets = new Hitbox(0, 0, 0, 0);	

		this.currentFrame = 0;

		this.isConsumable = true;
		this.isCollidable = true;
		this.isSolid = false;
		this.wasConsumed = false;
	}

	update(dt) {
		super.update(dt);
		
		this.hitbox.set(
			this.position.x,
			this.position.y,
			this.dimensions.x,
			this.dimensions.y
		);
	}
}