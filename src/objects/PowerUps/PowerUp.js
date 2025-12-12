import Vector from "../../../lib/Vector.js";
import GameObject from "../GameObject.js";
import Hitbox from "../../../lib/Hitbox.js";
import Sprite from "../../../lib/Sprite.js";
import { matter, world, images } from "../../globals.js";
import PowerUpType from "../../enums/PowerUpType.js";

const { Bodies, Composite } = matter;

export default class PowerUp extends GameObject {
	static WIDTH = 32;
	static HEIGHT = 32;

	constructor(position, map = null) {
		super(
			new Vector(PowerUp.WIDTH, PowerUp.HEIGHT),
			position
		);

		this.map = map;
		this.isConsumable = true;
		this.wasConsumed = false;
		this.currentFrame = 0;
		this.cleanUp = false;
		this.sprites = [];
		
		// Create Matter.js sensor body (for collision detection)
		this.body = Bodies.rectangle(
			position.x + PowerUp.WIDTH / 2,
			position.y + PowerUp.HEIGHT / 2,
			PowerUp.WIDTH,
			PowerUp.HEIGHT,
			{
				isStatic: true,
				isSensor: true,
				label: 'powerup'
			}
		);
		
		this.body.powerUpObject = this;
		Composite.add(world, this.body);
		
		// Setup hitbox
		this.hitboxOffsets = new Hitbox(0, 0, 0, 0);
		this.hitbox = new Hitbox(
			this.position.x,
			this.position.y,
			PowerUp.WIDTH,
			PowerUp.HEIGHT
		);
	}

		onConsume() {
			this.wasConsumed = true;
			this.cleanUp = true;
			if (this.body) {
				Composite.remove(world, this.body);
			}

			// Return to main map when collected in plinko
			if (this.map && this.map.playState && typeof this.map.playState.switchMap === "function") {
				this.map.playState.switchMap("map");
			}
		}

	update(dt) {
		super.update(dt);
		
		this.hitbox.set(
			this.position.x,
			this.position.y,
			PowerUp.WIDTH,
			PowerUp.HEIGHT
		);
	}

	render(offset = { x: 0, y: 0 }) {
		if (!this.wasConsumed) {
			super.render(offset);
		}
	}
	
	destroy() {
		if (this.body) {
			Composite.remove(world, this.body);
		}
	}

	/**
	 * Load sprite image based on power-up type
	 * @param {string} type - The power-up type from PowerUpType enum
	 */
	loadImageByType(type) {
		let imageName = null;
		let spriteWidth = PowerUp.WIDTH;
		let spriteHeight = PowerUp.HEIGHT;

		// Map power-up types to image names and dimensions
		switch (type) {
			case PowerUpType.SpeedPowerUp:
				imageName = "speed";
				spriteWidth = 31;
				spriteHeight = 25;
				break;
			case PowerUpType.AttackIncrease:
				imageName = "attack_increase";
				spriteWidth = 34;
				spriteHeight = 32;
				break;
			case PowerUpType.DefencePowerUp:
				imageName = "defence";
				spriteWidth = 30;
				spriteHeight = 32;
				break;
		}

		if (imageName) {
			const image = images.get(imageName);
			if (image) {
				this.sprites = Sprite.generateSpritesFromSpriteSheet(
					image,
					spriteWidth,
					spriteHeight
				);
			} else {
				console.warn(`PowerUp: Image not found for type "${type}"`);
			}
		}
	}
}