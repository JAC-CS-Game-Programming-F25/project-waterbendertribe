import GameEntity from "./GameEntity.js";
import { context, DEBUG, images, sounds, timer } from "../globals.js";
import StateMachine from "../../lib/StateMachine.js";
import PlayerWalkingState from "../states/entity/player/PlayerWalkingState.js";
import PlayerSwordSwingingState from "../states/entity/player/PlayerSwordSwingingState.js";
import PlayerIdlingState from "../states/entity/player/PlayerIdlingState.js";
import PlayerStateName from "../enums/PlayerStateName.js";
import Hitbox from "../../lib/Hitbox.js";
import ImageName from "../enums/ImageName.js";
import Sprite from "../../lib/Sprite.js";
import Room from "../objects/Room.js";
import Direction from "../enums/Direction.js";
import SoundName from "../enums/SoundName.js";
import PlayerCarryingState from "../states/entity/player/PlayerCarryingState.js";
import PlayerLiftingState from "../states/entity/player/PlayerLIftingState.js";
import PlayerCarryingIdlingState from "../states/entity/player/PlayerCarryingIdleState.js";
import PlayerThrowingState from "../states/entity/player/PlayerThrowingState.js";

export default class Player extends GameEntity {
  static WIDTH = 16;
  static HEIGHT = 22;
  static WALKING_SPRITE_WIDTH = 16;
  static WALKING_SPRITE_HEIGHT = 32;
  static Attack_SPRITE_WIDTH = 32;
  static Attack_SPRITE_HEIGHT = 32;
  static MAX_SPEED = 100;
  static MAX_HEALTH = 6;
  /**
   * The hero character the player controls in the map.
   * Has the ability to swing a sword to kill enemies
   * and will collide into objects that are collidable.
   */
  constructor() {
    super();

    this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.PlayerWalk),
      Player.WALKING_SPRITE_WIDTH,
      Player.WALKING_SPRITE_HEIGHT
    );
    this.swordSwingingSprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.PlayerSword),
      Player.SWORD_SWINGING_SPRITE_WIDTH,
      Player.SWORD_SWINGING_SPRITE_HEIGHT
    );

    this.sprites = this.walkingSprites;
    this.dimensions.x = Player.WIDTH;
    this.dimensions.y = Player.HEIGHT;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = null;
    this.stateMachine = this.initializeStateMachine();

    // Cats States
    // this.speed = Player.MAX_SPEED;
    // this.totalHealth = Player.MAX_HEALTH;
    // this.health = Player.MAX_HEALTH;
  }

  render() {
    context.save();
    super.render(this.positionOffset);
    context.restore();
  }

  initializeStateMachine() {
    const stateMachine = new StateMachine();

    stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
    // stateMachine.add(
    //   PlayerStateName.Attack,
    //   new PlayerAttackState(this)
    // );
    stateMachine.add(PlayerStateName.Idle, new PlayerIdlingState(this));
    stateMachine.change(PlayerStateName.Idle);

    return stateMachine;
  }

  // receiveDamage(damage) {
  //   this.health -= damage;
  //   sounds.play(SoundName.HitPlayer);
  // }

  // // Player receives health after health picked up
  // receiveHealth(amount = 2) {
  //   //MYUPDATE
  //   this.health = Math.min(this.health + amount, this.totalHealth);
  // }

  // may need this for cat losing health
  // becomeInvulnerable() {
  //   this.isInvulnerable = true;
  //   this.invulnerabilityTimer = this.startInvulnerabilityTimer();
  // }
  // startInvulnerabilityTimer() {
  //   const action = () => {
  //     this.alpha = this.alpha === 1 ? 0.5 : 1;
  //   };
  //   const interval = Player.INVULNERABLE_FLASH_INTERVAL;
  //   const duration = Player.INVULNERABLE_DURATION;
  //   const callback = () => {
  //     this.alpha = 1;
  //     this.isInvulnerable = false;
  //   };

  //   return timer.addTask(action, interval, duration, callback);
  // }
}
