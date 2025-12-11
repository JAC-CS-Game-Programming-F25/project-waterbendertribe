import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import GameObject from "./GameObject.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import Hitbox from '../../lib/Hitbox.js';

export default class Ball extends GameObject {
	static WIDTH = 32;
	static HEIGHT = 32;

	constructor(position, map = null) {
		super(
			new Vector(Ball.WIDTH, Ball.HEIGHT),
			position
		);
		
		// Keep reference to the map so we can request switches without callbacks
		this.map = map;

		this.sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Ball),
			Ball.WIDTH,
			Ball.HEIGHT
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

	onConsume() {
		this.wasConsumed = true;
		this.cleanUp = true;

		// switch to plinko map via the map instance
		if (this.map.switchMap) {
			this.map.switchMap("PlinkoMap");
		}
	}
}