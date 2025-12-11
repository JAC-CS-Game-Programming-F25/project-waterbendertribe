import Fonts from "../lib/Fonts.js";
import Images from "../lib/Images.js";
import Sounds from "../lib/Sounds.js";
import StateMachine from "../lib/StateMachine.js";
import Timer from "../lib/Timer.js";
import Input from "../lib/Input.js";

export const canvas = document.createElement("canvas");
export const context =
  canvas.getContext("2d") || new CanvasRenderingContext2D();

export let CANVAS_WIDTH = 1920;
export let CANVAS_HEIGHT = 960;

const resizeCanvas = () => {
  const scaleX = window.innerWidth / CANVAS_WIDTH;
  const scaleY = window.innerHeight / CANVAS_HEIGHT;
  const scale = Math.min(scaleX, scaleY); 

  canvas.style.width = `${CANVAS_WIDTH * scale}px`;
  canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
};

//update canvas dimensions based on current map
export function setCanvasSize(width, height) {
  CANVAS_WIDTH = width;
  CANVAS_HEIGHT = height;
  canvas.width = width;
  canvas.height = height;
  
  context.setTransform(1, 0, 0, 1, 0, 0); //reset the context state when canvas size changes
  context.imageSmoothingEnabled = false; //maintain pixel art quality
  
  resizeCanvas();
}

window.addEventListener("resize", resizeCanvas);

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
resizeCanvas();

export const keys = {};
export const images = new Images(context);
export const fonts = new Fonts();
export const stateMachine = new StateMachine();
export const timer = new Timer();
export const input = new Input(canvas);
export const sounds = new Sounds();

export const DEBUG = false;

