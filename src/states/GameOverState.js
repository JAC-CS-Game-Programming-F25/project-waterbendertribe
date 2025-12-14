import Input from '../../lib/Input.js';
import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import SoundName from '../enums/SoundName.js';
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	input,
	sounds,
	stateMachine,
} from '../globals.js';

export default class GameOverState extends State {
		/**
	 * Displays a game over screen where the player
	 * can press enter to go back to the title screen.
	 */
	constructor() {
		super();
	}

	enter() {
		sounds.stop(SoundName.Whistle);
	}

	update() {
		sounds.play(SoundName.Whistle);
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			sounds.stop(SoundName.Whistle);
			stateMachine.change(GameStateName.Transition, {
				fromState: this,
				toState: stateMachine.states[GameStateName.TitleScreen],
			});
		}
	}

	render() {
		context.fillStyle = 'black';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.font = '60px hunger_games_font';
		context.fillStyle = 'crimson';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		context.font = '30px hunger_games_font';
		context.fillStyle = 'white';
		context.fillText(
			'press enter to continue',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT - 40
		);
	}
}
