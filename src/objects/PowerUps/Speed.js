import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";
import CatStateName from "../../enums/CatStateName.js";
import { timer, matter, world} from "../../globals.js";

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

    // Get the player from playState (on the main map)
    if (this.playState && this.playState.mainMap && this.playState.mainMap.player) {
      const player = this.playState.mainMap.player;
      
      // // Apply speed boost and flag forced running
      player.speedBoostActive = true;
      player.isRunning = true;
      
      player.changeState(CatStateName.Running);

      // Reset after duration (use timer duration as the delay)
      timer.addTask(
        () => {},
        0,
        SpeedPowerUp.SPEED_DURATION,
        () => {
         player.speedBoostActive = false;
         player.isRunning = false;
          // Return to idle after boost ends
          player.changeState(CatStateName.Idling);
        }
      );
    }
    // Return to main map
       super.onConsume();
  }
}
