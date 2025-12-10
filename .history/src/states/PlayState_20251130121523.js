import State from "../../lib/State.js";

export default class PlayState extends State {
  constructor() {
    super();
    this.map = new Map(mapDefinition);
    this.player = new Player(50, 150, 16, 24, this.map);
    this.camera = new Camera(
      this.player,
      canvas.width,
      canvas.height,
      this.map.width * Tile.SIZE,
      this.map.height * Tile.SIZE
    );

    this.debug = new Debug();
  }

  update(dt) {
    this.map.update(dt);
    this.debug.update();
    this.camera.update(dt);
    this.player.update(dt);
  }

  /**
   * Renders the play state.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   */
  render(context) {
    this.camera.applyTransform(context);

    if (!debugOptions.mapGrid) {
      this.renderParallaxBackground();
    }

    this.map.render(context);
    this.player.render(context);

    this.camera.resetTransform(context);

    if (debugOptions.cameraCrosshair) {
      this.renderCameraGuidelines(context);
      this.renderLookahead(context);
    }

    if (debugOptions.watchPanel) {
      this.setDebugPanel();
    } else {
      this.debug.unwatch("Map");
      this.debug.unwatch("Camera");
      this.debug.unwatch("Player");
      this.debug.unwatch("Goombas");
    }
  }

  /**
   * Renders the camera lookahead crosshair for debugging.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   */
  renderLookahead(context) {
    const lookaheadPos = this.camera.getLookaheadPosition();
    const size = 10;

    context.strokeStyle = "rgba(255, 0, 0, 0.8)";
    context.lineWidth = 2;

    // Draw crosshair
    context.beginPath();
    context.moveTo(lookaheadPos.x - size, lookaheadPos.y);
    context.lineTo(lookaheadPos.x + size, lookaheadPos.y);
    context.moveTo(lookaheadPos.x, lookaheadPos.y - size);
    context.lineTo(lookaheadPos.x, lookaheadPos.y + size);
    context.stroke();

    // Draw circle
    context.beginPath();
    context.arc(lookaheadPos.x, lookaheadPos.y, size / 2, 0, Math.PI * 2);
    context.stroke();
  }

  /**
   * Renders camera guidelines for debugging.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   */
  renderCameraGuidelines(context) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    context.setLineDash([5, 5]);
    context.lineWidth = 1;
    context.strokeStyle = "rgba(255, 255, 255, 0.9)";

    // Draw vertical line
    context.beginPath();
    context.moveTo(centerX, 0);
    context.lineTo(centerX, canvas.height);
    context.stroke();

    // Draw horizontal line
    context.beginPath();
    context.moveTo(0, centerY);
    context.lineTo(canvas.width, centerY);
    context.stroke();

    context.setLineDash([]);
  }
}
