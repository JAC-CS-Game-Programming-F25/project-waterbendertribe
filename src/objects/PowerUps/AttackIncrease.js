import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";
import { timer } from "../../globals.js";

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

    if (this.playState && this.playState.mainMap && this.playState.mainMap.player) {

      const player = this.playState.mainMap.player;

      player.strength += AttackIncreasePowerUp.STRENGTH_INCREASE;

      timer.addTask(
        () => {},
        0,
        AttackIncreasePowerUp.DURATION,
        () => {
          player.strength = Math.max(0, player.strength - AttackIncreasePowerUp.INCREASE);
        }
      );
    }

    super.onConsume();
  }
}
