import DefencePowerUp from "../objects/PowerUps/Defence.js";
import SpeedPowerUp from "../objects/PowerUps/Speed.js";
import PowerUpType from "../enums/PowerUpType.js";
import PowerUp from "../objects/PowerUps/PowerUp.js";

export default class PowerUpFactory {
	/**
	 * @param {string} type A string using the PowerUpType enum.
	 * @param {number} x The X position
	 * @param {number} y The Y position
	 * @returns An instance of a power-up specified by PowerUpType.
	 */
	static createInstance(type, x, y) {
		switch (type) {
			case PowerUpType.AttackIncrease:
				return new PowerUp(x, y);
			case PowerUpType.SpeedPowerUp:
				return new SpeedPowerUp(x, y);
            case PowerUpType.DefencePowerUp:
				return new DefencePowerUp(x, y);
		}
	}
}
