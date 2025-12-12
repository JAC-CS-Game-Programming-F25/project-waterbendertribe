export default class Tile {
  static SIZE = 32;
  //static enemyCats = 20 Whenever we find a cat sprite

  /**
   * Represents one tile in a Layer and on the screen.
   *
   * @param {number} id
   * @param {array} sprites
   */
  constructor(id, sprites) {
    this.sprites = sprites;
    this.id = id;
  }

  render(x, y) {
    const sprite = this.sprites[this.id];
    if (!sprite) return;

    sprite.render(x * Tile.SIZE, y * Tile.SIZE);
  }
}
