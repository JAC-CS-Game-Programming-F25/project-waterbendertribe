// import Colour from "../enums/Colour.js";
// import Sprite from "../../lib/Sprite.js";
// import ImageName from "../enums/ImageName.js";
// import Tile from "./Tile.js";
// import Layer from "./Layer.js";
// import Camera from "./Camera.js";
// import {
//   CANVAS_HEIGHT,
//   CANVAS_WIDTH,
//   context,
//   DEBUG,
//   images,
// } from "../globals.js";
// import Vector from "../../lib/Vector.js";
// import Player from "../entities/player/Player.js";
// import Ball from "../objects/Ball.js";

// export default class Map {
//   constructor(mapDefinition, switchMapCallback = null) {
//     this.width = mapDefinition.width;
//     this.height = mapDefinition.height;

//     const sprites = this.loadTilesets(mapDefinition);

//     this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
//     this.collisionLayer = new Layer(
//       mapDefinition.layers[Layer.COLLISION],
//       sprites
//     );
//     this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);
//     this.player = new Player({ position: new Vector(20, 20) }, this);

//     // Determine if this is the main map (large map with camera) or plinko map (small, no camera)
//     this.useCamera = this.width > 20; // Main map is 60 wide, plinko is 15 wide

//     this.camera = new Camera(
//       this.player,
//       this.width * Tile.SIZE,
//       this.height * Tile.SIZE
//     );

//     // Store the map switch callback
//     this.switchMapCallback = switchMapCallback;

//     this.balls = [];
//     this.spawnRandomBalls(5);
//   }

//   /**
//    * Load tilesets based on map type
//    * @param {object} mapDefinition - The map definition from JSON
//    * @returns {Array} sprites array with all loaded sprites
//    */
//   loadTilesets(mapDefinition) {
//     let sprites;

//     // Check if this is the main map (width > 20) or plinko map
//     if (mapDefinition.width > 20) {

//       sprites = Sprite.generateSpritesFromSpriteSheet(
//         images.get(ImageName.Tiles),
//         Tile.SIZE,
//         Tile.SIZE
//       );

//     } else {

//       //for the Plinko map, load multiple tilesets
//       sprites = [];

//       //load each tileset and place sprites at correct indices based on firstgid
//       if (mapDefinition.tilesets && mapDefinition.tilesets.length > 0) {
//         mapDefinition.tilesets.forEach((tileset) => {
//           const firstgid = tileset.firstgid;
//           let imageName;

//           // Determine which image to use based on the tileset source
//           if (tileset.source.includes("tileset.tsx")) {
//             imageName = ImageName.Tiles;
//           } else if (tileset.source.includes("backg.tsx")) {
//             imageName = ImageName.PlinkoBackground;
//           } else if (tileset.source.includes("items.tsx")) {
//             imageName = ImageName.Items;
//           } else if (tileset.source.includes("spritesheet (5).tsx")) {
//             imageName = ImageName.Wall;
//           }

//           if (imageName) {
//             const image = images.get(imageName);
//             if (image) {
//               const tilesetSprites = Sprite.generateSpritesFromSpriteSheet(
//                 image,
//                 Tile.SIZE,
//                 Tile.SIZE
//               );

//               //place each sprite at the correct global ID
//               tilesetSprites.forEach((sprite, index) => {
//                 sprites[firstgid + index] = sprite;
//               });

//             } 
//           }
//         })
//         ;
//       }
//     }

//     return sprites;
//   }

//   update(dt) {
//     this.player.update(dt);
//     this.updateEntities(dt);
//     this.cleanUpEntities();
//   }

//   /**
//    * Spawn random balls on the map
//    * @param {number} count - Number of balls to spawn
//    */
//   spawnRandomBalls(count) {
//     for (let i = 0; i < count; i++) {
//       const randomX = Math.random() * (CANVAS_WIDTH - 100);
//       const randomY = Math.random() * (CANVAS_HEIGHT - 100);
//       this.balls.push(new Ball(new Vector(randomX, randomY), this.switchMapCallback));
//     }
//   }

//   cleanUpEntities() {
//     this.balls = this.balls.filter(ball => !ball.cleanUp);
// 		//this.entities = this.entities.filter((entity) => !entity.isDead);
// 		//this.objects = this.objects.filter((object) => !object.cleanUp);
// 	}

// 	updateEntities(dt) {

//      // Update all balls
//     this.balls.forEach(ball => ball.update(dt));
    
//     // Check collision between player and balls
//     this.balls.forEach(ball => {
//       if (this.player.hitbox && ball.didCollideWithEntity(this.player.hitbox)) {
//         if (ball.isConsumable && !ball.wasConsumed && !ball.cleanUp) {
//           ball.onConsume(this.player);
//         }
//       }
//     });
    
//     if (this.useCamera) {
//       this.camera.update(dt);
//     }
    

// 			// this.objects.forEach((object) => {

// 			// 	if (object.didCollideWithEntity(entity.hitbox)) {

// 			// 		if (object.isConsumable && entity === this.player && !object.wasConsumed && !object.cleanUp) { //for consumable items 
// 			// 			object.onConsume(this.player);
// 			// 		}
					
// 			// 		else if (object.isCollidable) { //for solid/collidable objects
// 			// 			object.onCollision(entity);
// 			// 		}
// 			// 	}
// 			// });
			
// 			//if (
// 		// 		!entity.isDead &&
// 		// 		this.player.didCollideWithEntity(entity.hitbox) &&
// 		// 		!this.player.isInvulnerable
// 		// 	) {
// 		// 		this.player.receiveDamage(entity.damage);
// 		// 		this.player.becomeInvulnerable();
// 		// 	}
// 		// });
// 	}


//   render() {
//     if (this.useCamera) {
//       this.camera.applyTransform(context);
//     }

//     this.bottomLayer.render();
//     this.collisionLayer.render();
//     this.player.render();
    
//     //render all balls
//     this.balls.forEach(ball => ball.render());
    
//     this.topLayer.render();

//     if (DEBUG) {
//       Map.renderGrid();
//     }

//     if (this.useCamera) {
//       this.camera.resetTransform(context);
//     }
//   }

//   static renderGrid() {
//     context.save();
//     context.strokeStyle = Colour.White;

//     for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
//       context.beginPath();
//       context.moveTo(0, y * Tile.SIZE);
//       context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
//       context.closePath();
//       context.stroke();

//       for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
//         context.beginPath();
//         context.moveTo(x * Tile.SIZE, 0);
//         context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
//         context.closePath();
//         context.stroke();
//       }
//     }

//     context.restore();
//   }
// }



import Colour from "../enums/Colour.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import Camera from "./Camera.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  context,
  DEBUG,
  images,
} from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/player/Player.js";
import Ball from "../objects/Ball.js";

export default class Map {
  constructor(mapDefinition, playState = null) {
    this.width = mapDefinition.width;
    this.height = mapDefinition.height;

    const sprites = this.loadTilesets(mapDefinition);

    this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
    this.collisionLayer = new Layer(
      mapDefinition.layers[Layer.COLLISION],
      sprites
    );
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);
    this.player = new Player({ position: new Vector(20, 20) }, this);

    // Determine if this is the main map (large map with camera) or plinko map (small, no camera)
    this.useCamera = this.width > 20; // Main map is 60 wide, plinko is 15 wide

    this.camera = new Camera(
      this.player,
      this.width * Tile.SIZE,
      this.height * Tile.SIZE
    );

    // Store the PlayState reference
    this.playState = playState;

    this.balls = [];
    
    // Only spawn balls on the main map
    if (this.useCamera) {
      this.spawnRandomBalls(5);
    }
  }

  /**
   * Load tilesets based on map type
   * @param {object} mapDefinition - The map definition from JSON
   * @returns {Array} sprites array with all loaded sprites
   */
  loadTilesets(mapDefinition) {
    let sprites;

    // Check if this is the main map (width > 20) or plinko map
    if (mapDefinition.width > 20) {

      sprites = Sprite.generateSpritesFromSpriteSheet(
        images.get(ImageName.Tiles),
        Tile.SIZE,
        Tile.SIZE
      );

    } else {

      //for the Plinko map, load multiple tilesets
      sprites = [];

      //load each tileset and place sprites at correct indices based on firstgid
      if (mapDefinition.tilesets && mapDefinition.tilesets.length > 0) {
        mapDefinition.tilesets.forEach((tileset) => {
          const firstgid = tileset.firstgid;
          let imageName;

          // Determine which image to use based on the tileset source
          if (tileset.source.includes("tileset.tsx")) {
            imageName = ImageName.Tiles;
          } else if (tileset.source.includes("backg.tsx")) {
            imageName = ImageName.PlinkoBackground;
          } else if (tileset.source.includes("items.tsx")) {
            imageName = ImageName.Items;
          } else if (tileset.source.includes("spritesheet (5).tsx")) {
            imageName = ImageName.Wall;
          }

          if (imageName) {
            const image = images.get(imageName);
            if (image) {
              const tilesetSprites = Sprite.generateSpritesFromSpriteSheet(
                image,
                Tile.SIZE,
                Tile.SIZE
              );

              //place each sprite at the correct global ID
              tilesetSprites.forEach((sprite, index) => {
                sprites[firstgid + index] = sprite;
              });

            } 
          }
        })
        ;
      }
    }

    return sprites;
  }

  update(dt) {
    this.player.update(dt);
    if (this.useCamera) {
      this.camera.update(dt);
    }
    this.updateEntities(dt);
    this.cleanUpEntities();
  }

  /**
   * Spawn random balls on the map
   * @param {number} count - Number of balls to spawn
   */
  spawnRandomBalls(count) {
    for (let i = 0; i < count; i++) {
      // Use world coordinates instead of canvas coordinates
      const randomX = Math.random() * (this.width * Tile.SIZE - 100) + 50;
      const randomY = Math.random() * (this.height * Tile.SIZE - 100) + 50;
      this.balls.push(new Ball(new Vector(randomX, randomY), this));
    }
  }

  cleanUpEntities() {
    this.balls = this.balls.filter(ball => !ball.cleanUp);
  }

  updateEntities(dt) {
    this.balls.forEach(ball => ball.update(dt));
    
    this.balls.forEach(ball => {
      if (ball.isConsumable && !ball.wasConsumed && !ball.cleanUp) {
        if (ball.hitbox.didCollide(this.player.hitbox)) {
          ball.onConsume(this.player);
        }
      }
    });
  }

  render() {
    if (this.useCamera) {
      this.camera.applyTransform(context);
    }

    this.bottomLayer.render();
    this.collisionLayer.render();
    
    //render all balls
    this.balls.forEach(ball => ball.render());
    
    this.player.render();
    this.topLayer.render();

    if (DEBUG) {
      Map.renderGrid();
    }

    if (this.useCamera) {
      this.camera.resetTransform(context);
    }
  }

  static renderGrid() {
    context.save();
    context.strokeStyle = Colour.White;

    for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
      context.beginPath();
      context.moveTo(0, y * Tile.SIZE);
      context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
      context.closePath();
      context.stroke();

      for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
        context.beginPath();
        context.moveTo(x * Tile.SIZE, 0);
        context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
        context.closePath();
        context.stroke();
      }
    }

    context.restore();
  }
}