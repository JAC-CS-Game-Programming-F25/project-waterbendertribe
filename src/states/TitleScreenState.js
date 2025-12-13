import Input from '../../lib/Input.js';
import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import ImageName from '../enums/ImageName.js';
//import SoundName from '../../enums/SoundName.js';
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	images,
	input,
	sounds,
	stateMachine,
	timer,
} from '../globals.js';
import SaveManager from '../services/SaveManager.js';

export default class TitleScreenState extends State {
	/**
	 * Displays a title screen where the player
	 * can press enter to start a new game.
	 */
	constructor() {
		super();
	}

	enter() {
		this.playState = stateMachine.states[GameStateName.Play];
		if (this.playState && this.playState.mainMap) {
			this.playState.mainMap.wins = SaveManager.loadWins();
		}
		//sounds.play(SoundName.Rain);
	}

	exit() {
		//sounds.stop(SoundName.Rain);
	}

	update(dt) {
		timer.update(dt);

		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			this.playState?.resetMainMap();
			stateMachine.change(GameStateName.Transition, {
				fromState: this,
				toState: stateMachine.states[GameStateName.Countdown],
			});
		}
	}

	render() {
		images.render(ImageName.TitleScreenBackground, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.font = '60px hunger_games_font';
		context.fillStyle = 'yellow';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Hunger Cats', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		context.font = '30px hunger_games_font';
		context.fillStyle = 'white';
		context.fillText(
			'press enter to begin',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT - 80
		);
		context.font = '35px hunger_games_font';
		context.fillStyle = 'gold';
		const wins = this.playState && this.playState.mainMap ? this.playState.mainMap.wins : 0;
		context.fillText(`Wins: ${wins}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
	}
}
