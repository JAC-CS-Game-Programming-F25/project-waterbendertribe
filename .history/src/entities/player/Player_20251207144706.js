import { images, sounds } from "../../globals.js";
import {
  bigSpriteConfig,
  loadPlayerSprites,
  smallSpriteConfig,
} from "../../../config/SpriteConfig.js";
import Vector from "../../../lib/Vector.js";
import ImageName from "../../enums/ImageName.js";
import Animation from "../../../lib/Animation.js";
import Map from "../../services/Map.js";
import Entity from "../Entity.js";
import StateMachine from "../../../lib/StateMachine.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import PlayerWalkingState from "./PlayerWalkingState.js";
import PlayerJumpingState from "./PlayerJumpingState.js";
import PlayerSkiddingState from "./PlayerSkiddingState.js";
import PlayerFallingState from "./PlayerFallingState.js";
import PlayerIdlingState from "./PlayerIdlingState.js";
import PlayerShrinkingState from "./PlayerShrinkState.js";
import PlayerGrowingState from "./PlayerGrowState.js";
import PlayerDyingState from "./PlayerDyingState.js";
import { timer } from "../../globals.js";
import SoundName from "../../enums/SoundName.js";

/**
 * Represents the player character in the game.
 * @extends Entity
 */
export default class Player extends Entity {
  /**
   * Creates a new Player instance.
   * @param {number} x - The initial x-coordinate.
   * @param {number} y - The initial y-coordinate.
   * @param {number} width - The width of the player.
   * @param {number} height - The height of the player.
   * @param {Map} map - The game map instance.
   */
  constructor(x, y, width, height, map) {
    super(x, y, width, height);

    this.initialPosition = new Vector(x, y);
    this.position = new Vector(x, y);
    this.dimensions = new Vector(width, height);
    this.velocity = new Vector(0, 0);
    this.map = map;
    this.facingRight = true;
    this.isDead = false;
    this.isInvincible = false;
    this.blinkVisible = true;
    this.isBig = false;
    this.isTransforming = false;

    // Load player sprites
    this.sprites = loadPlayerSprites(
      images.get(ImageName.Mario),
      smallSpriteConfig
    );

    // Create animations for different player states
    this.animations = {
      idle: new Animation(this.sprites.idle),
      walk: new Animation(this.sprites.walk, 0.07),
      death: new Animation(this.sprites.death), // update
    };

    this.currentAnimation = this.animations.idle;

    // Initialize state machine for player behavior
    this.stateMachine = new StateMachine();

    // Add states to the state machine
    // this.stateMachine.add(
    //   PlayerStateName.Walking,
    //   new PlayerWalkingState(this)
    // );

    // this.stateMachine.add(PlayerStateName.Dying, new PlayerDyingState(this));
    this.stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));
  }

  /**
   * Updates the player's state.
   * @param {number} dt - The time passed since the last update.
   */
  update(dt) {}

  /**
   * Renders the player.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   */
  render(context) {
    context.save();

    // If invincible, highlight Mario's sprite (not a box)
    if (this.isInvincible && this.blinkVisible) {
      // update
      // Draw the sprite normally first
      this.stateMachine.render(context);

      // Apply bright tint on top of Mario only
      context.globalAlpha = 0.5;
      context.globalCompositeOperation = "source-atop";
      context.fillStyle = "rgba(182, 182, 182, 1)";
      context.fillRect(
        this.position.x,
        this.position.y,
        this.dimensions.x,
        this.dimensions.y
      );
    } else {
      // Normal rendering when not invincible
      this.stateMachine.render(context);
    }

    context.restore();
  }

  startInvincibility(duration = 2) {
    // update
    this.isInvincible = true;
    this.blinkVisible = true;

    // toggle only the visual blink every 0.15 s
    timer.addTask(
      () => (this.blinkVisible = !this.blinkVisible),
      0.15,
      duration,
      () => {
        // after timer ends
        this.isInvincible = false;
        this.blinkVisible = true;
      }
    );
  }
}
