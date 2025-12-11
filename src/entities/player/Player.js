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
import { images, context, DEBUG, input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class Player extends GameEntity {
  static CAT_WALKING_WIDTH = 32;
  static CAT_WALKING_HEIGHT = 32;
  static CAT_RUNNING_HEIGHT = 32;
  static CAT_RUNNING_WIDTH = 32;
  static SCALE = 1.7;

  constructor(entityDefinition = {}, map) {
    super(entityDefinition);

    this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.CatWalk),
      Player.CAT_WALKING_WIDTH,
      Player.CAT_WALKING_HEIGHT
    );
    this.runningSprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.CatRunning),
      Player.CAT_RUNNING_WIDTH,
      Player.CAT_RUNNING_HEIGHT
    );

    this.map = map;
    this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);
    this.isRunning = false;

    // Body hitbox - for collision with walls/objects (red)
    this.bodyHitbox = new Hitbox(0, 0, 20, 12, "red");
    this.bodyHitboxOffsets = { x: 8.5, y: 20 };

    this.clawHitbox = new Hitbox(0, 0, 0, 0, "yellow"); // Claw hitbox

    this.spaceWasHeld = false;

    this.stateMachine = this.initializeStateMachine();
    this.sprites = this.walkingSprites;
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);
    this.currentFrame = this.currentAnimation.getCurrentFrame();

    // Update hitbox position based on player position
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

  // /**
  //  * Track key states to prevent holding from repeatedly triggering actions
  //  */
  // updateKeyStates() {
  //   // Update space state
  //   const spaceHeld = input.isKeyHeld(Input.KEYS.SPACE);
  //   this.spaceJustPressed = spaceHeld && !this.spaceWasHeld;
  //   this.spaceWasHeld = spaceHeld;
  // }

  render() {
    const x = Math.floor(this.canvasPosition.x);
    const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

    const cameraScale = this.map.camera.scale;
    const effectiveScale = Player.SCALE / cameraScale;

    context.save();
    context.translate(x, y);
    context.scale(effectiveScale, effectiveScale);
    this.sprites[this.currentFrame].render(0, 0);
    context.restore();

    // DEBUG: Draw both hitboxes
    if (DEBUG) {
      // Draw body hitbox (red)
      this.bodyHitbox.render(context);

      // Draw claw hitbox (yellow) - only if it has dimensions
      if (
        this.clawHitbox.dimensions.x > 0 &&
        this.clawHitbox.dimensions.y > 0
      ) {
        this.clawHitbox.render(context);
      }
    }
  }

  // Set claw hitbox
  activateClawHitbox(x, y, width, height) {
    this.clawHitbox.set(x, y, width, height);
  }

  // Reset claw hitbox
  deactivateClawHitbox() {
    this.clawHitbox.set(0, 0, 0, 0);
  }

  // Make the hitbox active
  isClawActive() {
    return this.clawHitbox.dimensions.x > 0 && this.clawHitbox.dimensions.y > 0;
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
