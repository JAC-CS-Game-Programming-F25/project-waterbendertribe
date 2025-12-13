import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class EnemyAttackState extends State {
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
   * In this state, the enemy attacks with their claws.
   * Creates a temporary hitbox similar to Zelda's enemy attacks.
   */
  constructor(enemy) {
    super();
    this.enemy = enemy;

    this.animation = {
      [Direction.Up]: new Animation([4, 5, 6, 7, 0, 1], 0.05, 1),
      [Direction.Down]: new Animation([20, 21, 22, 23, 16, 17], 0.05, 1),
      [Direction.Left]: new Animation([28, 29, 30, 31, 24, 25], 0.05, 1),
      [Direction.Right]: new Animation([12, 13, 14, 15, 8, 7], 0.05, 1),
    };

    // Track if hitbox was already activated this attack (Zelda-style)
    this.hitboxActivated = false;
  }

  enter() {
    this.enemy.sprites = this.enemy.runningSprites;
    this.enemy.currentAnimation = this.animation[this.enemy.direction];
    this.hitboxActivated = false; // Reset flag when entering state
  }

  exit() {
    // Clear hitbox when exiting (Zelda-style)
    this.enemy.clawHitbox.set(0, 0, 0, 0);
    this.enemy.sprites = this.enemy.walkingSprites;
  }

  update() {
    // Return to idle when animation finishes
    if (this.enemy.currentAnimation.isDone()) {
      this.enemy.currentAnimation.refresh();
      this.enemy.changeState(EnemyStateName.Idling);
    }

    // Activate hitbox halfway through animation (Zelda-style)
    // Only activate once per attack to prevent multiple hits
    if (this.enemy.currentAnimation.isHalfwayDone() && !this.hitboxActivated) {
      this.setClawHitbox();
      this.hitboxActivated = true;
    }
  }

  /**
   * Set the claw hitbox based on enemy direction (Zelda-style)
   */
  setClawHitbox() {
    const scale = this.enemy.constructor.SCALE || 1;
    const spriteWidth = 32 * scale;
    const spriteHeight = 32 * scale;

    const baseX = this.enemy.canvasPosition.x;
    const baseY = this.enemy.canvasPosition.y - this.enemy.dimensions.y / 2;

    const direction = this.enemy.direction;
    const offset = EnemyAttackState.OFFSETS[direction];

    const hitboxConfig = this.getHitboxConfig(
      direction,
      baseX,
      baseY,
      spriteWidth,
      spriteHeight,
      offset
    );

    this.enemy.clawHitbox.set(
      hitboxConfig.x,
      hitboxConfig.y,
      hitboxConfig.width,
      hitboxConfig.height
    );
  }

  /**
   * Returns hitbox configuration for the given direction
   */
  getHitboxConfig(direction, baseX, baseY, spriteWidth, spriteHeight, offset) {
    const { CLAW_REACH, CLAW_WIDTH, CLAW_HEIGHT } = EnemyAttackState;

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
