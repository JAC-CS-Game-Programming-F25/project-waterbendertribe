import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import CatStateName from "../../enums/CatStateName.js";
import Input from "../../../lib/Input.js";
import { input, sounds } from "../../globals.js";
import Tile from "../../services/Tile.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerWalkingState extends State {
  // Movement speed while walking
  static MOVE_SPEED = 110;

  /**
   * Handles player behavior while walking
   */
  constructor(player) {
    super();
    this.player = player;

    // Cache map layers for collision checks
    this.bottomLayer = this.player.map.bottomLayer;
    this.collisionLayer = this.player.map.collisionLayer;

    // Walking animations for each direction
    this.animation = {
      [Direction.Up]: new Animation([0, 1, 2, 3], 0.09),
      [Direction.Down]: new Animation([8, 9, 10, 11], 0.09),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.09),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.09),
    };
  }

  /**
   * Called when the player enters the walking state
   */
  enter() {
    // Use walking sprites and correct animation
    this.player.sprites = this.player.walkingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
  }

  /**
   * Runs every frame while the player is walking
   */
  update(dt) {
    // Keep animation synced with direction
    this.player.currentAnimation = this.animation[this.player.direction];
    this.handleMovement(dt);
  }

  /**
   * Handles input and state transitions while walking
   */
  handleMovement(dt) {
    // If speed boost becomes active, switch to running
    if (this.player.speedBoostActive) {
      this.player.changeState(CatStateName.Running);
      return;
    }

    // Start attack if spaace key is pressedd
    if (input.isKeyPressed(Input.KEYS.SPACE)) {
      this.player.changeState(CatStateName.Attacking);
    }

    // Stop walking if no movement keys are held
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

  /**
   * Updates player direction based on input
   */
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

  /**
   * Moves the player and checks for collisions
   */
  move(dt) {
    const moveDelta = PlayerWalkingState.MOVE_SPEED * dt;

    let newpositionX = this.player.position.x;
    let newpositionY = this.player.position.y;

    // Apply movement in one direction
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

    // Apply movement if valid, otherwise play bump sound
    if (this.isValidMove(newpositionX, newpositionY)) {
      this.player.position.x = newpositionX;
      this.player.position.y = newpositionY;
    } else {
      sounds.play(SoundName.PlayerBump);
    }
  }

  /**
   * Checks collision tiles using the player body hitboxx
   */
  isValidMove(positionX, positionY) {
    const offsetX = this.player.bodyHitboxOffsets.x;
    const offsetY = this.player.bodyHitboxOffsets.y;
    const hitboxWidth = this.player.bodyHitbox.dimensions.x;
    const hitboxHeight = this.player.bodyHitbox.dimensions.y;

    const renderY = positionY - this.player.dimensions.y / 2;
    const collisionYOffset = -20;
    const insetAmount = 10;

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
