import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import CatStateName from "../../enums/CatStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerIdlingState extends State {
  /**
   * Handles player behavior when standing still
   */
  constructor(player) {
    super();

    this.player = player;

    // Sngle frame idle animations for each direction
    this.animation = {
      [Direction.Up]: new Animation([0], 1),
      [Direction.Down]: new Animation([8], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  /**
   * Called when the player enters the idle state
   */
  enter() {
    //sets idle animation based on current direction
    this.player.currentAnimation = this.animation[this.player.direction];
  }

  /**
   * Runs every frame while the player is idle
   */
  update() {
    this.handleInput();
  }

  /**
   * Handles player input while idle
   */
  handleInput() {
    // Start attack if space key is pressedd
    if (input.isKeyPressed(Input.KEYS.SPACE)) {
      this.player.changeState(CatStateName.Attacking);
      return;
    }

    //check if any movement key is being held
    const isMoving =
      input.isKeyHeld(Input.KEYS.S) ||
      input.isKeyHeld(Input.KEYS.D) ||
      input.isKeyHeld(Input.KEYS.W) ||
      input.isKeyHeld(Input.KEYS.A);

    if (isMoving) {
      // Updae direction based on input
      if (input.isKeyHeld(Input.KEYS.S)) {
        this.player.direction = Direction.Down;
      } else if (input.isKeyHeld(Input.KEYS.D)) {
        this.player.direction = Direction.Right;
      } else if (input.isKeyHeld(Input.KEYS.W)) {
        this.player.direction = Direction.Up;
      } else if (input.isKeyHeld(Input.KEYS.A)) {
        this.player.direction = Direction.Left;
      }

      // Choose movement state based on speed boost
      if (this.player.speedBoostActive) {
        this.player.changeState(CatStateName.Running);
      } else {
        this.player.changeState(CatStateName.Walking);
      }
    }
  }
}
