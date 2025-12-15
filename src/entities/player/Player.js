import GameEntity from "../GameEntity.js";
import PlayerIdlingState from "../../states/player/PlayerIdlingState.js";
import PlayerWalkingState from "../../states/player/PlayerWalkingState.js";
import PlayerRunningState from "../../states/player/PlayerRunningState.js";
import PlayerAttackState from "../../states/player/PlayerAttackState.js";
import Vector from "../../../lib/Vector.js";
import ImageName from "../../enums/ImageName.js";
import StateMachine from "../../../lib/StateMachine.js";
import CatStateName from "../../enums/CatStateName.js";
import Sprite from "../../../lib/Sprite.js";
import Hitbox from "../../../lib/Hitbox.js";
import { images, context, DEBUG, timer } from "../../globals.js";

export default class Player extends GameEntity {
  // Sprite dimensions and visual scale
  static CAT_WALKING_WIDTH = 32;
  static CAT_WALKING_HEIGHT = 32;
  static CAT_RUNNING_HEIGHT = 32;
  static CAT_RUNNING_WIDTH = 32;
  static SCALE = 1.7;

  // Invulnerability timing after taking damage
  static INVULNERABLE_DURATION = 1.5;
  static INVULNERABLE_FLASH_INTERVAL = 0.1;

  /**
   * Creates the player entity, loads sprites, hitboxes, and state machine
   */
  constructor(entityDefinition = {}, map) {
    super({
      ...entityDefinition,
    });

    // Load walking and running animations
    this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.RedCatWalking),
      Player.CAT_WALKING_WIDTH,
      Player.CAT_WALKING_HEIGHT
    );
    this.runningSprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.RedCatRunning),
      Player.CAT_RUNNING_WIDTH,
      Player.CAT_RUNNING_HEIGHT
    );

    this.map = map;
    this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);

    // Body hitbox positioned under the sprite for accurate collisions
    this.bodyHitbox = new Hitbox(0, 0, 20, 12, "red");
    this.bodyHitboxOffsets = { x: 8.5, y: 20 };

    // State machine controls player behavior
    this.stateMachine = this.initializeStateMachine();
    this.sprites = this.walkingSprites;
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  /**
   * Updates movement, animation frame, and hitbox position
   */
  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);
    this.currentFrame = this.currentAnimation.getCurrentFrame();
    this.updateBodyHitbox();
  }

  /**
   * Keeps the body hitbox aligned with the sprite position
   */
  updateBodyHitbox() {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y - this.dimensions.y / 2);

    this.bodyHitbox.set(
      x + this.bodyHitboxOffsets.x,
      y + this.bodyHitboxOffsets.y,
      20,
      12
    );
  }

  /**
   * Renders the player sprite and optional debug visuals
   */
  render() {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y - this.dimensions.y / 2);

    // Adjust scale based on camera zoom level
    const cameraScale = this.map.camera.scale;
    const effectiveScale = Player.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);
    context.globalAlpha = this.alpha;

    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    // Debug hitboxes
    if (DEBUG) {
      this.bodyHitbox.render(context);
      if (this.isClawActive()) {
        this.clawHitbox.render(context);
      }
    }
  }

  /**
   * Enables temporary invulnerability after taking damage
   */
  becomeInvulnerable() {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = this.startInvulnerabilityTimer();
  }

  /**
   * Handles flashing effect and timing during invulnerability
   */
  startInvulnerabilityTimer() {
    const action = () => {
      this.alpha = this.alpha === 1 ? 0.15 : 1;
    };

    const interval = Player.INVULNERABLE_FLASH_INTERVAL;
    const duration = Player.INVULNERABLE_DURATION;

    const callback = () => {
      this.alpha = 1;
      this.isInvulnerable = false;
    };

    return timer.addTask(action, interval, duration, callback);
  }

  /**
   *uses the claw hitbox when attacking, otherwise uses the body hitbox
   */
  didCollideWithEntity(hitbox) {
    if (this.isClawActive()) {
      return this.clawHitbox.didCollide(hitbox);
    }
    return this.bodyHitbox.didCollide(hitbox);
  }

  /**
   * Resets player state after death or restart
   */
  reset() {
    this.health = this.totalHealth;
    this.isInvulnerable = false;
    this.alpha = 1;
    this.invulnerabilityTimer?.clear();
  }

  /**
   * Sets up plyer state machine and default state
   */
  initializeStateMachine() {
    const stateMachine = new StateMachine();

    stateMachine.add(CatStateName.Idling, new PlayerIdlingState(this));
    stateMachine.add(CatStateName.Walking, new PlayerWalkingState(this));
    stateMachine.add(CatStateName.Running, new PlayerRunningState(this));
    stateMachine.add(CatStateName.Attacking, new PlayerAttackState(this));

    stateMachine.change(CatStateName.Idling);
    return stateMachine;
  }
}
