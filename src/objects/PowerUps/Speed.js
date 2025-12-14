import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";
import CatStateName from "../../enums/CatStateName.js";
import { timer, stateMachine } from "../../globals.js";
import GameStateName from "../../enums/GameStateName.js";

/**
 * SpeedPowerUp temporarily increases the player's movement speed.
 *
 * It activates a speed boost flag and transitions the player to `Running` once
 * the timer is up it then reverts back to its normal speed/ idling. 
 */
export default class SpeedPowerUp extends PowerUp {
  static SPRITE_MEASUREMENTS = [{ x: 32, y: 4, width: 31, height: 25 }];
  static SPEED_DURATION = 10;

  constructor(x, y) {
    super(x, y);

    const spriteSheet = "power_up_sheet";
    this.sprites = GameMatter.generateSprites(
      SpeedPowerUp.SPRITE_MEASUREMENTS,
      spriteSheet
    );
  }

  onConsume() {
    const playState =
      this.plinkoState?.constructor?.name === "PlinkoState"
        ? stateMachine.states[GameStateName.Play]
        : this.plinkoState;

    const player = playState?.map?.player;

    if (player) {
      player.speedBoostActive = true;
      player.isRunning = true;

      player.changeState(CatStateName.Running);

      timer.addTask(
        () => {},
        0,
        SpeedPowerUp.SPEED_DURATION,
        () => {
          player.speedBoostActive = false;
          player.isRunning = false;
          player.changeState(CatStateName.Idling);
        }
      );
    }

    super.onConsume();
  }
}
