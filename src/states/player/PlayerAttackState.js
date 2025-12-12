import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import CatStateName from "../../enums/CatStateName.js";
import { sounds } from "../../globals.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerAttackState extends State {
  static CLAW_REACH = 20;
  static CLAW_WIDTH = 20;
  static CLAW_HEIGHT = 20;

  static OFFSETS = {
    [Direction.Left]: { x: 6, y: -2 },
    [Direction.Right]: { x: -25, y: -2 },
    [Direction.Up]: { x: -9, y: 15 },
    [Direction.Down]: { x: -9, y: -20 },
  };
  /**
   * In this state, the cat player attacks with their claws.
   * This creates a temporary hitbox that enemies can potentially collide into.
   *
   * @param {Player} player
   */
  constructor(player) {
    super();
    this.player = player;

    this.animation = {
      [Direction.Up]: new Animation([4, 5, 6, 7, 0, 1], 0.05, 1),
      [Direction.Down]: new Animation([20, 21, 22, 23, 16, 17], 0.05, 1),
      [Direction.Left]: new Animation([28, 29, 30, 31, 24, 25], 0.05, 1),
      [Direction.Right]: new Animation([12, 13, 14, 15, 8, 7], 0.05, 1),
    };
  }

  enter() {
    this.player.sprites = this.player.runningSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
  }

  exit() {
    this.player.clawHitbox.set(0, 0, 0, 0);

    this.player.sprites = this.player.walkingSprites;
  }

  update() {
    if (this.player.currentAnimation.isDone()) {
      this.player.currentAnimation.refresh();
      this.player.changeState(CatStateName.Idling);
    }

    if (this.player.currentAnimation.isHalfwayDone()) {
      this.setClawHitbox();
    }
  }

  setClawHitbox() {
    const scale = this.player.constructor.SCALE || 1;
    const spriteWidth = 32 * scale;
    const spriteHeight = 32 * scale;

    const baseX = this.player.canvasPosition.x;
    const baseY = this.player.canvasPosition.y - this.player.dimensions.y / 2;

    const direction = this.player.direction;
    const offset = PlayerAttackState.OFFSETS[direction];

    // Calculate hitbox based on direction using a lookup table approach
    const hitboxConfig = this.getHitboxConfig(
      direction,
      baseX,
      baseY,
      spriteWidth,
      spriteHeight,
      offset
    );

    this.player.clawHitbox.set(
      hitboxConfig.x,
      hitboxConfig.y,
      hitboxConfig.width,
      hitboxConfig.height
    );
  }

  /**
   * Returns hitbox configuration for the given direction
   * More efficient than if/else chain - uses object lookup
   */
  getHitboxConfig(direction, baseX, baseY, spriteWidth, spriteHeight, offset) {
    const { CLAW_REACH, CLAW_WIDTH, CLAW_HEIGHT } = PlayerAttackState;

    const configs = {
      [Direction.Left]: {
        width: CLAW_REACH,
        height: CLAW_HEIGHT,
        x: baseX - CLAW_REACH + offset.x,
        y: baseY + offset.y + (spriteHeight - CLAW_HEIGHT) / 2,
      },
      [Direction.Right]: {
        width: CLAW_REACH,
        height: CLAW_HEIGHT,
        x: baseX + spriteWidth + offset.x,
        y: baseY + offset.y + (spriteHeight - CLAW_HEIGHT) / 2,
      },
      [Direction.Up]: {
        width: CLAW_WIDTH,
        height: CLAW_REACH,
        x: baseX + offset.x + (spriteWidth - CLAW_WIDTH) / 2,
        y: baseY - CLAW_REACH + offset.y,
      },
      [Direction.Down]: {
        width: CLAW_WIDTH,
        height: CLAW_REACH,
        x: baseX + offset.x + (spriteWidth - CLAW_WIDTH) / 2,
        y: baseY + spriteHeight + offset.y,
      },
    };

    return configs[direction];
  }
}
