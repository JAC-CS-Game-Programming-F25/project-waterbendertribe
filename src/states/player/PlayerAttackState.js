import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import CatStateName from "../../enums/CatStateName.js";
import Player from "../../entities/player/Player.js";
import { sounds } from "../../globals.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerAttackState extends State {
  // Size and reach of the claw attack
  static CLAW_REACH = 20;
  static CLAW_WIDTH = 20;
  static CLAW_HEIGHT = 20;

  // Direction based offsets to position the claw correctly
  static OFFSETS = {
    [Direction.Left]: { x: 6, y: -2 },
    [Direction.Right]: { x: -25, y: -2 },
    [Direction.Up]: { x: -9, y: 15 },
    [Direction.Down]: { x: -9, y: -20 },
  };

  /**
   * Handles player behavior while attacking
   */
  constructor(player) {
    super();
    this.player = player;

    // Attack animations for each direction
    this.animation = {
      [Direction.Up]: new Animation([4, 5, 6, 7, 0, 1], 0.05, 1),
      [Direction.Down]: new Animation([20, 21, 22, 23, 16, 17], 0.05, 1),
      [Direction.Left]: new Animation([28, 29, 30, 31, 24, 25], 0.05, 1),
      [Direction.Right]: new Animation([12, 13, 14, 15, 8, 7], 0.05, 1),
    };

    // Prevents hitbox from activating more than once per attack
    this.hitboxActivated = false;
  }

  /**
   * Called when the attack state begins
   */
  enter() {
    // Use running sprites during attack
    this.player.sprites = this.player.runningSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
    this.hitboxActivated = false;
    sounds.play(SoundName.CatSlash);
  }

  /**
   * Cleans up when leaving the attack state
   */
  exit() {
    // Remove the claw hitbox
    this.player.clawHitbox.set(0, 0, 0, 0);

    // Restore correct sprite set after attack
    this.player.sprites = this.player.speedBoostActive
      ? this.player.runningSprites
      : this.player.walkingSprites;
  }

  /**
   * Updates attack animation and handles state transitions
   */
  update() {
    // When the attack animation ends, return to movement
    if (this.player.currentAnimation.isDone()) {
      this.player.currentAnimation.refresh();

      if (this.player.speedBoostActive) {
        this.player.changeState(CatStateName.Running);
      } else {
        this.player.changeState(CatStateName.Idling);
      }
    }

    // Activate the claw hitbox halfway through the animation
    if (this.player.currentAnimation.isHalfwayDone() && !this.hitboxActivated) {
      this.setClawHitbox();
      this.hitboxActivated = true;
    }
  }

  /**
   * Positions and enables the claw hitbox based on player direction
   */
  setClawHitbox() {
    const scale = Player.SCALE || 1;
    const spriteWidth = 32 * scale;
    const spriteHeight = 32 * scale;

    const baseX = this.player.position.x;
    const baseY = this.player.position.y - this.player.dimensions.y / 2;

    const direction = this.player.direction;
    const offset = PlayerAttackState.OFFSETS[direction];

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
   * Calculates the claw hitbox size and position for each direction
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
