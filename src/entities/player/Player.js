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
  static CAT_WALKING_WIDTH = 32;
  static CAT_WALKING_HEIGHT = 32;
  static CAT_RUNNING_HEIGHT = 32;
  static CAT_RUNNING_WIDTH = 32;
  static SCALE = 1.7;
  static MAX_SPEED = 100;
  static MAX_HEALTH = 6;

  // Invulnerability settings
  static INVULNERABLE_DURATION = 1.5;
  static INVULNERABLE_FLASH_INTERVAL = 0.1;

  constructor(entityDefinition = {}, map) {
    super(entityDefinition);

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
    this.isRunning = false;

    // Body hitbox
    this.bodyHitbox = new Hitbox(0, 0, 20, 12, "red");
    this.bodyHitboxOffsets = { x: 8.5, y: 20 };

    this.clawHitbox = new Hitbox(0, 0, 0, 0, "yellow");

    //States
    this.speed = Player.MAX_SPEED;
    this.totalHealth = Player.MAX_HEALTH;
    this.health = Player.MAX_HEALTH;
    this.strength = 1;
    this.defense = 1;

    // Invulnerability system
    this.isInvulnerable = false;
    this.alpha = 1;
    this.invulnerabilityTimer = null;

    this.stateMachine = this.initializeStateMachine();
    this.sprites = this.walkingSprites;
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);
    this.currentFrame = this.currentAnimation.getCurrentFrame();
    this.updateBodyHitbox();
  }

  updateBodyHitbox() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

    this.bodyHitbox.set(
      x + this.bodyHitboxOffsets.x,
      y + this.bodyHitboxOffsets.y,
      20,
      12
    );
  }

  render() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

    const cameraScale = this.map.camera.scale;
    const effectiveScale = Player.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);

    // Apply alpha for invulnerability flashing
    context.globalAlpha = this.alpha;

    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    if (DEBUG) {
      this.bodyHitbox.render(context);
      if (
        this.clawHitbox.dimensions.x > 0 &&
        this.clawHitbox.dimensions.y > 0
      ) {
        this.clawHitbox.render(context);
      }
    }
  }

  activateClawHitbox(x, y, width, height) {
    this.clawHitbox.set(x, y, width, height);
  }

  deactivateClawHitbox() {
    this.clawHitbox.set(0, 0, 0, 0);
  }

  isClawActive() {
    return this.clawHitbox.dimensions.x > 0 && this.clawHitbox.dimensions.y > 0;
  }

  /**
   * Check collision with entity using AABB collision detection
   * Uses CLAW hitbox when attacking, BODY hitbox otherwise
   * @param {Hitbox} hitbox - The hitbox to check collision against
   * @returns {boolean} Whether collision occurred
   */
  didCollideWithEntity(hitbox) {
    // If claw is active (attacking), check claw collision
    if (this.isClawActive()) {
      return this.clawHitbox.didCollide(hitbox);
    }

    return this.bodyHitbox.didCollide(hitbox);
  }

  /**
   * This will setup damage taken
   */
  receiveDamage(damage) {
    if (this.isInvulnerable) {
      return;
    }

    this.health -= damage;

    // Activate invulnerability after taking damage
    this.becomeInvulnerable();

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }

    // sounds.play(SoundName.HitPlayer);
  }

  /**
   * Reference to Zelda this will start i-frames
   */
  becomeInvulnerable() {
    this.isInvulnerable = true;
    this.invulnerabilityTimer = this.startInvulnerabilityTimer();
  }

  /**
   * This is the timer of how long the invulnerability lasts
   */
  startInvulnerabilityTimer() {
    const action = () => {
      this.alpha = this.alpha === 1 ? 0.5 : 1;
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
   * Once Game over this will reset the player state
   */
  reset() {
    this.health = Player.MAX_HEALTH;
    this.isInvulnerable = false;
    this.alpha = 1;
    this.invulnerabilityTimer?.clear();
  }

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
