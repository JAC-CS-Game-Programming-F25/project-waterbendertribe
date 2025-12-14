export default class SaveManager {
	static WINS_KEY = 'hunger-cats-wins';

	/**
	 * Save the total wins to `localStorage`.
	 * @param {number} wins - The player's total victories.
	 */
	static saveWins(wins) {
		try {
			localStorage.setItem(SaveManager.WINS_KEY, JSON.stringify({ wins }));
		} catch (error) {
			console.warn('Failed to save wins', error);
		}
	}

	/**
	 * Load the total wins from `localStorage`.
	 * @returns {number} The player's total victories, or 0 if unavailable.
	 */
	static loadWins() {
		try {
			const data = localStorage.getItem(SaveManager.WINS_KEY);
			if (!data) return 0;
			const parsed = JSON.parse(data);
			return Number.isFinite(parsed.wins) ? parsed.wins : 0;
		} catch (error) {
			console.warn('Failed to load wins', error);
			return 0;
		}
	}
}
