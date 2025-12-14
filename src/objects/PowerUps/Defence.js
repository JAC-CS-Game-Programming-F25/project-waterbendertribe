import { images, stateMachine } from "../../globals.js";
import PowerUp from "./PowerUp.js";
import GameMatter from "../GameMatter.js";
import { timer } from "../../globals.js";
import GameStateName from "../../enums/GameStateName.js";

export default class DefencePowerUp extends PowerUp {
	static SPRITE_MEASUREMENTS = [{ x: 64, y: 0, width: 32, height: 32}];

	constructor(x, y) {
		super(x, y);

		const spriteSheet = "power_up_sheet";
		this.sprites = GameMatter.generateSprites(DefencePowerUp.SPRITE_MEASUREMENTS, spriteSheet);	
	}

  onConsume() {

	const playState = this.plinkoState?.constructor?.name === 'PlinkoState' 
      ? stateMachine.states[GameStateName.Play] 
      : this.plinkoState;
    
    const player = playState?.map?.player;

    if (player) {
      player.defense += 1;

      timer.addTask(
        () => {},
        0,
        10,
        () => {
          player.defense = Math.max(0, player.defense - 1);
        }
      );
    }

    super.onConsume();
  }

}
