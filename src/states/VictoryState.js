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

export default class VictoryState extends State {

	constructor() {
		super();
	}

	enter() {
		//get wins
		const playState = stateMachine.states[GameStateName.Play];

		if (playState && playState.mainMap) {

			playState.mainMap.wins++;
			SaveManager.saveWins(playState.mainMap.wins);
		}
	}

	update() {
		if (input.isKeyPressed(Input.KEYS.ENTER)) {
			stateMachine.change(GameStateName.Transition, {
				fromState: this,
				toState: stateMachine.states[GameStateName.TitleScreen],
			});
		}
	}

	render() {
	images.render(ImageName.TitleScreenBackground, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.font = '60px HungerGames';
		context.fillStyle = 'yellow';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('YOU WON THE HUNGER CAT GAMES!!!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		context.font = '30px HungerGames';
		context.fillStyle = 'white';
		context.fillText(
			'press enter to replay',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT - 80
		);
		context.font = '35px HungerGames';
		context.fillStyle = 'gold';
	}
}
