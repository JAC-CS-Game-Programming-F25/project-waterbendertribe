import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	stateMachine,
	timer,
} from '../globals.js';

export default class CountdownState extends State {
	/**
	 * Displays the game with a 3-second countdown before play begins.
	 */
	constructor() {
		super();
		this.countdownTime = 3;
		this.map = null;
	}

	enter(parameters) {
        
		//display main map
		const playState = stateMachine.states[GameStateName.Play];
		this.map = playState && playState.mainMap ? playState.mainMap : null;
		this.countdownTime = 3;
		
		timer.addTask(
			() => {
				this.countdownTime -= 1;
			},
			1, //for every 1 second
			3, 
			() => {
				stateMachine.change(GameStateName.Play);
			}
		);
	}

	update(dt) {
		timer.update(dt);
	}

	render() {

		if (this.map) {
			this.map.render();
		}

		context.fillStyle = 'rgba(0, 0, 0, 0.3)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		context.font = 'bold 120px HungerGames';
		context.fillStyle = 'gold';
		context.textBaseline = 'middle';
		context.textAlign = 'center';

		if (this.countdownTime > 0) {
			context.fillText(this.countdownTime, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		} 
	}
}
