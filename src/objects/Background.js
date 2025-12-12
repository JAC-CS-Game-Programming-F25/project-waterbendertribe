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
    this.sprites.forEach((sprite, index) => {
      sprite.render(
        index * Background.WIDTH,
        CANVAS_HEIGHT - Background.HEIGHT
      );
    });
  }

  static generateSprites() {
    const sprite = new Sprite(
      images.get(ImageName.Background),
      0,
      0,
      Background.WIDTH,
      Background.HEIGHT
    );

    const count = Math.ceil(CANVAS_WIDTH / Background.WIDTH);

    return Array.from({ length: count }, () => sprite);
  }
}
