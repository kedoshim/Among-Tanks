import { Controller } from "./controller.js";

/**
* Represents the controller used by the player
*/
export class PlayerController extends Controller {
  constructor(target, keys) {
    super(target);

    // console.log(keys);

    this._up = keys.up;
    this._down = keys.down;
    this._left = keys.left;
    this._right = keys.right;
    this._shoot = keys.shoot;
  }

  set up(key) {
    this._up = key;
  }

  set down(key) {
    this._down = key;
  }

  set left(key) {
    this._left = key;
  }

  set right(key) {
    this._right = key;
  }

  set shoot(key) {
    this._shoot = key;
  }

  // Getter for all keys
  get keys() {
    return {
      up: this._up,
      down: this._down,
      left: this._left,
      right: this._right,
      shoot: this._shoot,
    };
  }

  control(keyboard) {
    var moveX = 0;
    var moveZ = 0;

    // Check movement direction based on pressed keys
    if (keyboard.pressed(this._up)) {
      moveZ--;
    }
    if (keyboard.pressed(this._down)) {
      moveZ++;
    }
    if (keyboard.pressed(this._right)) {
      moveX++;
    }
    if (keyboard.pressed(this._left)) {
      moveX--;
    }

    this._shoot.every((key,index) => {
      if (keyboard.down(key)) {
        this._target.shoot();
        return false;
      } else {
        return true;
      }
    });

    this._target.move(moveX, moveZ);
  }
}