import Colour from "../enums/Colour.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  context,
  DEBUG,
  images,
} from "../globals.js";

export default class Map {
  constructor(mapDefinition) {

    const sprites = [];
    
    // Load each tileset and place sprites at correct indices based on firstgid
    mapDefinition.tilesets.forEach(tileset => {
      const firstgid = tileset.firstgid;
      let imageName;
      
      // Determine which image to use based on the tileset source
      if (tileset.source.includes('backg.tsx')) {
        imageName = ImageName.PlinkoBackground;
      } else if (tileset.source.includes('items.tsx')) {
        imageName = ImageName.Items;
      } else if (tileset.source.includes('spritesheet (5).tsx')) {
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
          
          console.log(`Loaded ${imageName}: ${tilesetSprites.length} sprites starting at gid ${firstgid}`);
        } else {
          console.warn(`Image ${imageName} not found`);
        }
      }
    });
    
    this.width = mapDefinition.width;
    this.height = mapDefinition.height;

    this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
    this.collisionLayer = new Layer(
      mapDefinition.layers[Layer.COLLISION],
      sprites
    );
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);
  }

  update(dt) {
    // Map update logic (no player yet)
  }

  render(context) {
    this.bottomLayer.render();
    this.collisionLayer.render();
    this.topLayer.render();

    if (DEBUG) {
      Map.renderGrid();
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