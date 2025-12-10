import GameEntity from "../GameEntity.js";
import PlayerIdlingState from "../../states/player/PlayerIdlingState.js";
import PlayerWalkingState from "../../states/player/PlayerWalkingState.js";
import PlayerRunningState from "../../states/player/PlayerRunningState.js";
import Vector from "../../../lib/Vector.js";
import ImageName from "../../enums/ImageName.js";
import StateMachine from "../../../lib/StateMachine.js";
import CatStateName from "../../enums/CatStateName.js";
import Sprite from "../../../lib/Sprite.js";
import { images, context, DEBUG } from "../../globals.js";

export default class Player extends GameEntity {
  static CAT_WALKING_WIDTH = 32;
  static CAT_WALKING_HEIGHT = 32;
  static CAT_RUNNING_HEIGHT = 32;
  static CAT_RUNNING_WIDTH = 32;
  /**
   * The character that the player controls in the map.
   * Has a party of Pokemon they can use to battle other Pokemon.
   *
   * @param {object} entityDefinition
   * @param {Map} map
   */
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
    this.isRunning = false; // Toggle for running mode
    this.stateMachine = this.initializeStateMachine();
    this.sprites = this.walkingSprites; // Start with walking sprites
    this.currentAnimation =
      this.stateMachine.currentState.animation[this.direction];
  }

  update(dt) {
    super.update(dt);
    this.currentAnimation.update(dt);

    this.currentFrame = this.currentAnimation.getCurrentFrame();
  }

  render() {
    const x = Math.floor(this.canvasPosition.x);

    /**
     * Offset the Y coordinate to provide a more "accurate" visual.
     * To see the difference, remove the offset and bump into something
     * either above or below the character and you'll see why this is here.
     */
    const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

    super.render(x, y);

    // DEBUG: Draw hitbox
    if (DEBUG) {
      context.strokeStyle = "red";
      context.strokeRect(x + 6, y + 20, 20, 12);
    }
  }

  initializeStateMachine() {
    const stateMachine = new StateMachine();

    stateMachine.add(CatStateName.Walking, new PlayerWalkingState(this));
    stateMachine.add(CatStateName.Running, new PlayerRunningState(this));
    stateMachine.add(CatStateName.Idling, new PlayerIdlingState(this));

    stateMachine.change(CatStateName.Idling);

    return stateMachine;
  }
}
