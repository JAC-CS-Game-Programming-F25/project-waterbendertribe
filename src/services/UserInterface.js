import Sprite from "../../lib/Sprite.js";
import Player from "../entities/player/Player.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Tile from "./Tile.js";
import { context } from "../globals.js";

export default class UserInterface {
  static EMPTY_HEART = 0;
  static QUARTER_HEART = 1;
  static HALF_HEART = 2;
  static THREE_QUARETER_HEART = 3;
  static FULL_HEART = 4;

  static HEART_WIDTH = 16;
  static HEART_HEIGHT = 16;
  static SCALE = 2;

  /**
   * Displays the number of hearts in the top-left corner.
   *
   * @param {Player} player
   */
  constructor(player) {
    this.player = player;
    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Hearts),
      UserInterface.HEART_WIDTH,
      UserInterface.HEART_HEIGHT
    );
  }

  render() {
    // Draw player hearts on the top of the screen.
    let healthLeft = this.player.health;
    let heartFrame = 0;

    const totalHeart = Math.ceil(this.player.totalHealth);

    for (let i = 0; i < this.player.totalHealth / 2; i++) {
      if (healthLeft > 1) {
        heartFrame = UserInterface.FULL_HEART;
      } else if (healthLeft === 1) {
        heartFrame = UserInterface.HALF_HEART;
      } else {
        heartFrame = UserInterface.EMPTY_HEART;
      }

      context.save();
      context.scale(UserInterface.SCALE, UserInterface.SCALE);

      this.sprites[heartFrame].render(i * UserInterface.HEART_WIDTH, 0);

      context.restore();
      healthLeft -= 2;
    }
  }
}
