import Colour from "../enums/Colour.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import PowerUpType from "../enums/PowerUpType.js";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  context,
  DEBUG,
  images,
  engine,
  matter,
  world,
} from "../globals.js";
import Vector from "../../lib/Vector.js";
import PlinkoSquishyCat from "../objects/PlinkoSquishyCat.js";
import PowerUp from "../objects/PowerUps/PowerUp.js";

const { Bodies, Composite, Events } = matter;

export default class PlinkoMap {
  constructor(mapDefinition, playState = null) {
    this.width = mapDefinition.width;
    this.height = mapDefinition.height;
    this.playState = playState;

    const sprites = this.loadTilesets(mapDefinition);

    this.bottomLayer = new Layer(mapDefinition.layers[Layer.BOTTOM], sprites);
    this.collisionLayer = new Layer(mapDefinition.layers[Layer.COLLISION],sprites);
    this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);

    this.collisionData = mapDefinition.layers[Layer.COLLISION]?.data || [];

    this.squishyCat = null;
    this.obstacles = [];
    this.powerUps = [];

    this.squishyCat = new PlinkoSquishyCat(this);
    this.createObstaclesFromCollisionLayer();
    this.spawnPowerUps();
    this.setupCollisionHandling();
  }

  /**
   * Spawn power-ups at the bottom of the plinko map
   */
  spawnPowerUps() {
    const bottomY = (this.height - 1) * Tile.SIZE;
    const powerUpTypes = [
      PowerUpType.AttackIncrease,
      PowerUpType.SpeedPowerUp,
      PowerUpType.DefencePowerUp
    ];
    
    const spacing = (this.width * Tile.SIZE) / 7;
    
    powerUpTypes.forEach((type, index) => {
      const x = spacing * (index + 3) - PowerUp.WIDTH / 1;
      const y = bottomY;
      const powerUp = new PowerUp(new Vector(x, y), this);
      powerUp.loadImageByType(type);
      this.powerUps.push(powerUp);
    });
  }

  /**
   * Setup Matter.js collision detection for squishy cat hitting power-ups GARBAGE, THIS IS TEMP 
   */
  setupCollisionHandling() {
    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        
        if (this.isCatParticle(bodyA) && bodyB.label === 'powerup') {
          const powerUp = bodyB.powerUpObject;
          if (powerUp && !powerUp.wasConsumed) {
            powerUp.onConsume(this.squishyCat);
          }
        } else if (this.isCatParticle(bodyB) && bodyA.label === 'powerup') {
          const powerUp = bodyA.powerUpObject;
          if (powerUp && !powerUp.wasConsumed) {
            powerUp.onConsume(this.squishyCat);
          }
        }
      });
    });
  }

  /**
   * Check if a Matter body is part of the squishy cat
   */
  isCatParticle(body) {
    return body.label === 'squishyCatParticle';
  }

  /**
   * Load tilesets for plinko map
   * @param {object} mapDefinition - The map definition from JSON
   * @returns {Array} sprites array with all loaded sprites
   */
  loadTilesets(mapDefinition) {
    const sprites = [];

    if (mapDefinition.tilesets && mapDefinition.tilesets.length > 0) {
      mapDefinition.tilesets.forEach((tileset) => {
        const firstgid = tileset.firstgid;
        let imageName;

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
            tilesetSprites.forEach((sprite, index) => {
              sprites[firstgid + index] = sprite;
            });
          }
        }
      });
    }

    return sprites;
  }

  /**
   * Create Matter physics bodies from collision layer tiles
   */
  createObstaclesFromCollisionLayer() {
    if (!this.collisionData || this.collisionData.length === 0) {
      return;
    }

    for (let i = 0; i < this.collisionData.length; i++) {
      let tileId = this.collisionData[i];
      tileId--;

      if (tileId >= 0) {
        const col = i % this.width;
        const row = Math.floor(i / this.width);
        const x = col * Tile.SIZE + Tile.SIZE / 2;
        const y = row * Tile.SIZE + Tile.SIZE / 2;

        const radius = Tile.SIZE / 2;
        const obstacle = Bodies.circle(x, y, radius, {
          isStatic: true,
          restitution: 0.9,
          friction: 0.1,
          label: "obstacle",
        });

        Composite.add(world, obstacle);
        this.obstacles.push(obstacle);
      }
    }
  }

  cleanUpEntities() {
    this.powerUps = this.powerUps.filter(powerUp => !powerUp.cleanUp);
  }

  update(dt) {
    matter.Engine.update(engine, dt * 1000);
    
    if (this.squishyCat) {
      this.squishyCat.update(dt);
    }
    
    // Update power-ups
    this.powerUps.forEach(powerUp => powerUp.update(dt));
    
    this.cleanUpEntities();
  }

  render() {
    this.bottomLayer.render();
    this.collisionLayer.render();
    
    // Render power-ups
    this.powerUps.forEach(powerUp => powerUp.render());
    
    if (this.squishyCat) {
      this.squishyCat.render(context);
    }
    
    this.topLayer.render();

    if (DEBUG) {
      PlinkoMap.renderGrid();
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