import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import CatStateName from "../../enums/CatStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerIdlingState extends State {
  constructor(player) {
    super();

    this.player = player;
    this.animation = {
      [Direction.Up]: new Animation([0], 1),
      [Direction.Down]: new Animation([8], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  enter() {
    this.player.currentAnimation = this.animation[this.player.direction];
  }

  update() {
    if (input.isKeyPressed("SHIFT")) {
      this.player.isRunning = !this.player.isRunning;
    }

    const isMoving =
      input.isKeyHeld(Input.KEYS.S) ||
      input.isKeyHeld(Input.KEYS.D) ||
      input.isKeyHeld(Input.KEYS.W) ||
      input.isKeyHeld(Input.KEYS.A);

    if (isMoving) {
      if (input.isKeyHeld(Input.KEYS.S)) {
        this.player.direction = Direction.Down;
      } else if (input.isKeyHeld(Input.KEYS.D)) {
        this.player.direction = Direction.Right;
      } else if (input.isKeyHeld(Input.KEYS.W)) {
        this.player.direction = Direction.Up;
      } else if (input.isKeyHeld(Input.KEYS.A)) {
        this.player.direction = Direction.Left;
      }

      if (this.player.isRunning) {
        this.player.changeState(CatStateName.Running);
      } else {
        this.player.changeState(CatStateName.Walking);
      }
    }
  }
}
