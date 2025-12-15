import Vector from "../../lib/Vector.js";
import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import { images, timer } from "../globals.js";
import ImageName from "../enums/ImageName.js";
import PowerUpType from "../enums/PowerUpType.js";
import Enemy from "../entities/Enemy.js";
import Player from "../entities/player/Player.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import PowerUp from "../enums/PowerUpType.js";

export default class Ball extends GameObject {
  static WIDTH = 32;
  static HEIGHT = 32;

  constructor(position, map = null) {
    super(new Vector(Ball.WIDTH, Ball.HEIGHT), position);

    this.map = map;

    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Ball),
      Ball.WIDTH,
      Ball.HEIGHT
    );

    this.currentFrame = 0;

    this.isConsumable = true;
    this.isCollidable = true;
    this.isSolid = false;
    this.wasConsumed = false;
  }

  update(dt) {
    super.update(dt);

    if (this.hitbox) {
      this.hitbox.set(
        this.position.x,
        this.position.y,
        this.dimensions.x,
        this.dimensions.y
      );
    }
  }

  onConsume(consumer) {
    this.wasConsumed = true;
    this.cleanUp = true;

    if (!consumer || consumer.isDead) return;

    //randomly get power up for enemy
    const powerUpValues = Object.values(PowerUp);
    const randomType =
      powerUpValues[Math.floor(Math.random() * powerUpValues.length)];

    // Player  Plinko
    if (consumer instanceof Player) {
      if (this.map?.switchMap) {
        this.map.switchMap("PlinkoMap");
      }
      return;
    }

    // Enemy timed buff
    if (consumer instanceof Enemy) {
      this.applyEnemyPowerUp(randomType, consumer);
    }
  }

  applyEnemyPowerUp(type, enemy) {
    const DURATION = 10;

    switch (type) {
      case PowerUpType.AttackIncrease: {
        enemy.strength += 1;

        timer.addTask(
          () => {},
          0,
          DURATION,
          () => {
            if (!enemy.isDead) {
              enemy.strength = Math.max(0, enemy.strength - 1);
            }
          }
        );
        break;
      }

      case PowerUpType.DefencePowerUp: {
        enemy.defense += 1;

        timer.addTask(
          () => {},
          0,
          DURATION,
          () => {
            if (!enemy.isDead) {
              enemy.defense = Math.max(0, enemy.defense - 1);
            }
          }
        );
        break;
      }

      case PowerUpType.SpeedPowerUp: {
        // states will handle animation/speed
        enemy.speedBoostActive = true;

        //I enemy is currently moving walking, switch to Running
        const currentState =
          enemy.stateMachine?.currentState?.constructor?.name;
        if (currentState === "EnemyWalkingState") {
          enemy.changeState(EnemyStateName.Running);
        }

        //timer runs for 10 seconds, checking every frame
        timer.addTask(
          () => {
            //Count down happens automatically in timer
          },
          0,
          DURATION,
          () => {
            // After 10 seconds, deactivate boost
            if (!enemy.isDead) {
              enemy.speedBoostActive = false;

              // If currently running, switch back to walking
              const currentState =
                enemy.stateMachine?.currentState?.constructor?.name;
              if (currentState === "EnemyRunningState") {
                enemy.changeState(EnemyStateName.Walking);
              }
            }
          }
        );
        break;
      }
    }
  }
}
