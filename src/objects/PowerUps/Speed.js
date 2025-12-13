import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";

export default class SpeedPowerUp extends PowerUp {
  static SPRITE_MEASUREMENTS = [{ x: 32, y: 4, width: 31, height: 25 }];
	static SPEED_INCREASE = 400;
	static SPEED_DURATION = 15;

  constructor(x, y) {
    super(x, y);

    const spriteSheet = "power_up_sheet";
    this.sprites = GameMatter.generateSprites(
      SpeedPowerUp.SPRITE_MEASUREMENTS,
      spriteSheet
    );


  }

//  onConsume() {
//     this.wasConsumed = true;
//     this.shouldCleanUp = true;

//     // Apply speed boost to player if available
//     if (this.player) {
//       this.player.move(SPEED_INCREASE);
      
//       // Reset after duration
//       setTimeout(() => {
       
//       }, SpeedPowerUp.SPEED_DURATION * 1000);
//     }
    
//     // Remove from physics world
//     if (this.body) {
//       Composite.remove(world, this.body);
//     }
//   }
}

// static WIDTH = 32;
// 	static HEIGHT = 32;

// 	constructor(position, map = null) {
// 		super(
// 			new Vector(SpeedPowerUp.WIDTH, SpeedPowerUp.HEIGHT),
// 			position
// 		);

// 		this.map = map;

// 		this.sprites = Sprite.generateSpritesFromSpriteSheet(
// 			images.get(ImageName.SpeedPowerUp),
// 			SpeedPowerUp.WIDTH,
// 			SpeedPowerUp.HEIGHT
// 		);

// 		this.hitboxOffsets = new Hitbox(0, 0, 0, 0);

// 		this.currentFrame = 0;

// 		this.isConsumable = true;
// 		this.isCollidable = true;
// 		this.isSolid = false;
// 		this.wasConsumed = false;
// 	}

// 	update(dt) {
// 		super.update(dt);

// 		this.hitbox.set(
// 			this.position.x,
// 			this.position.y,
// 			this.dimensions.x,
// 			this.dimensions.y
// 		);
// 	}


// import PowerUp from "./PowerUp.js";
// import GameMatter from "../GameMatter.js";

// export default class SpeedPowerUp extends PowerUp {
//   static SPRITE_MEASUREMENTS = [{ x: 2, y: 90, width: 90, height: 128 }];

//   constructor(x, y) {
//     super(x, y);

//     const spriteSheet = "power_up_sheet";
//     this.sprites = GameMatter.generateSprites(
//       SpeedPowerUp.SPRITE_MEASUREMENTS,
//       spriteSheet
//     );

//     // Adjust render offset for speed sprite
//     this.renderOffset = { x: -45, y: -64 };
//   }
// }