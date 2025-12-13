import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, images } from "../globals.js";

export default class Background {
  static WIDTH = 480;
  static HEIGHT = 352;

  constructor() {
    this.sprites = Background.generateSprites();
  }

  render() {
    this.sprites[0].render(0, CANVAS_HEIGHT - Background.HEIGHT);
  }

  static generateSprites() {
    return [
      new Sprite(
        images.get(ImageName.PlinkoBackground),
        0,
        0,
        Background.WIDTH,
        Background.HEIGHT
      ),
    ];
  }
}
