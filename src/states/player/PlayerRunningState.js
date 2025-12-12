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
    if (input.isKeyPressed(Input.KEYS.SHIFT)) {
      this.player.isRunning = !this.player.isRunning;
    }

    if (input.isKeyPressed(Input.KEYS.SPACE)) {
      this.player.changeState(CatStateName.Attacking);
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

    if (!this.player.isRunning) {
      this.player.changeState(CatStateName.Walking);
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

    let newCanvasX = this.player.canvasPosition.x;
    let newCanvasY = this.player.canvasPosition.y;

    switch (this.player.direction) {
      case Direction.Up:
        newCanvasY -= moveDelta;
        break;
      case Direction.Down:
        newCanvasY += moveDelta;
        break;
      case Direction.Left:
        newCanvasX -= moveDelta;
        break;
      case Direction.Right:
        newCanvasX += moveDelta;
        break;
    }

    if (this.isValidMove(newCanvasX, newCanvasY)) {
      this.player.canvasPosition.x = newCanvasX;
      this.player.canvasPosition.y = newCanvasY;
      this.player.position.x = Math.floor(newCanvasX / Tile.SIZE);
      this.player.position.y = Math.floor(newCanvasY / Tile.SIZE);
    } else {
      sounds.play(SoundName.PlayerBump);
    }
  }

  isValidMove(canvasX, canvasY) {
    // Calculate where the body hitbox would be at the new position
    const offsetX = this.player.bodyHitboxOffsets.x;
    const offsetY = this.player.bodyHitboxOffsets.y;
    const hitboxWidth = this.player.bodyHitbox.dimensions.x;
    const hitboxHeight = this.player.bodyHitbox.dimensions.y;

    const renderY = canvasY - this.player.dimensions.y / 2;
    const collisionYOffset = -20;
    const insetAmount = 6;

    // Check three points across the hitbox width
    const leftX = Math.floor((canvasX + offsetX + insetAmount) / Tile.SIZE);
    const centerX = Math.floor(
      (canvasX + offsetX + hitboxWidth / 2) / Tile.SIZE
    );
    const rightX = Math.floor(
      (canvasX + offsetX + hitboxWidth - insetAmount) / Tile.SIZE
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
