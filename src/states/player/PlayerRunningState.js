import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import CatStateName from "../../enums/CatStateName.js";
import Input from "../../../lib/Input.js";
import { input, sounds } from "../../globals.js";
import Tile from "../../services/Tile.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerRunningState extends State {
  static MOVE_SPEED = 200;

  constructor(player) {
    super();
    this.player = player;
    this.bottomLayer = this.player.map.bottomLayer;
    this.collisionLayer = this.player.map.collisionLayer;

    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.05),
      [Direction.Down]: new Animation([16, 17, 18, 19, 20, 21, 22, 23], 0.05),
      [Direction.Left]: new Animation([24, 25, 26, 27, 28, 29, 30, 31], 0.05),
      [Direction.Right]: new Animation([8, 9, 10, 11, 12, 13, 14, 15], 0.05),
    };
  }

  enter() {
    this.player.currentAnimation = this.animation[this.player.direction];
    this.player.sprites = this.player.runningSprites;
  }

  exit() {
    this.player.sprites = this.player.walkingSprites;
  }

  update(dt) {
    this.player.currentAnimation = this.animation[this.player.direction];
    this.handleMovement(dt);
  }

  handleMovement(dt) {
    // ✅ CRITICAL: If speed boost ended while running, switch to Walking
    if (!this.player.speedBoostActive) {
      this.player.changeState(CatStateName.Walking);
      return;
    }

    if (input.isKeyPressed(Input.KEYS.SPACE)) {
      this.player.changeState(CatStateName.Attacking);
      return;
    }

    if (
      !input.isKeyHeld(Input.KEYS.W) &&
      !input.isKeyHeld(Input.KEYS.A) &&
      !input.isKeyHeld(Input.KEYS.S) &&
      !input.isKeyHeld(Input.KEYS.D)
    ) {
      this.player.changeState(CatStateName.Idling);
      return;
    }

    this.updateDirection();
    this.move(dt);
  }

  updateDirection() {
    if (input.isKeyHeld(Input.KEYS.S)) {
      this.player.direction = Direction.Down;
    } else if (input.isKeyHeld(Input.KEYS.D)) {
      this.player.direction = Direction.Right;
    } else if (input.isKeyHeld(Input.KEYS.W)) {
      this.player.direction = Direction.Up;
    } else if (input.isKeyHeld(Input.KEYS.A)) {
      this.player.direction = Direction.Left;
    }
  }

  move(dt) {
    const moveDelta = PlayerRunningState.MOVE_SPEED * dt;

    let newpositionX = this.player.position.x;
    let newpositionY = this.player.position.y;

    switch (this.player.direction) {
      case Direction.Up:
        newpositionY -= moveDelta;
        break;
      case Direction.Down:
        newpositionY += moveDelta;
        break;
      case Direction.Left:
        newpositionX -= moveDelta;
        break;
      case Direction.Right:
        newpositionX += moveDelta;
        break;
    }

    if (this.isValidMove(newpositionX, newpositionY)) {
      this.player.position.x = newpositionX;
      this.player.position.y = newpositionY;
    } else {
      sounds.play(SoundName.PlayerBump);
    }
  }

  isValidMove(positionX, positionY) {
    const offsetX = this.player.bodyHitboxOffsets.x;
    const offsetY = this.player.bodyHitboxOffsets.y;
    const hitboxWidth = this.player.bodyHitbox.dimensions.x;
    const hitboxHeight = this.player.bodyHitbox.dimensions.y;

    const renderY = positionY - this.player.dimensions.y / 2;
    const collisionYOffset = -20;
    const insetAmount = 6;

    const leftX = Math.floor((positionX + offsetX + insetAmount) / Tile.SIZE);
    const centerX = Math.floor(
      (positionX + offsetX + hitboxWidth / 2) / Tile.SIZE
    );
    const rightX = Math.floor(
      (positionX + offsetX + hitboxWidth - insetAmount) / Tile.SIZE
    );
    const centerY = Math.floor(
      (renderY + offsetY + collisionYOffset + hitboxHeight / 2) / Tile.SIZE
    );

    return (
      this.collisionLayer.getTile(leftX, centerY) === null &&
      this.collisionLayer.getTile(centerX, centerY) === null &&
      this.collisionLayer.getTile(rightX, centerY) === null
    );
  }
}
