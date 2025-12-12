import AttackIncrease from "../objects/PowerUps/AttackIncrease";
import DefencePowerUp from "../objects/PowerUps/Defence";
import SpeedPowerUp from "../objects/PowerUps/Speed";
import PowerUpType from "../enums/PowerUpType.js";

export default class PowerUpFactory {
	/**
	 * @param {string} type A string using the EnemyType enum.
	 * @param {array} sprites The sprites to be used for the enemy.
	 * @returns An instance of an enemy specified by EnemyType.
	 */
	static createInstance(type, sprites) {
		switch (type) {
			case PowerUpType.AttackIncrease:
				return new AttackIncrease(sprites);
			case PowerUpType.Speed:
				return new DefencePowerUp(sprites);
            case PowerUpType.Defence:
				return new SpeedPowerUp(sprites);
		}
	}
}
