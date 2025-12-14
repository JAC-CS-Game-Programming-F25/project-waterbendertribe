import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";
import { timer, stateMachine } from "../../globals.js";
import GameStateName from "../../enums/GameStateName.js";

 /**
   * Applies an attack increase effect to the player and a duration 
   * for how long it can last.
   *
   * Increases `player.strength` by `STRENGTH_INCREASE` 
   * Accesses the player through `PlayState` via the `stateMachine`
   */
export default class AttackIncreasePowerUp extends PowerUp {
  static SPRITE_MEASUREMENTS = [{ x: 0, y: 0, width: 32, height: 32 }];
  static DURATION = 10;
  static STRENGTH_INCREASE = 1;

  constructor(x, y) {
    super(x, y);

    const spriteSheet = "power_up_sheet";
    this.sprites = GameMatter.generateSprites(
      AttackIncreasePowerUp.SPRITE_MEASUREMENTS,
      spriteSheet
    );
  }

  onConsume() {
    //get player from the main PlayState through stateMachine
    const playState =
      this.plinkoState?.constructor?.name === "PlinkoState"
        ? stateMachine.states[GameStateName.Play]
        : this.plinkoState;

    const player = playState?.map?.player;

    if (player) {
      player.strength += AttackIncreasePowerUp.STRENGTH_INCREASE;

      timer.addTask(
        () => {},
        0,
        AttackIncreasePowerUp.DURATION,
        () => {
          player.strength = Math.max(
            0,
            player.strength - AttackIncreasePowerUp.STRENGTH_INCREASE
          );
        }
      );
    }

    super.onConsume();
  }
}
