import { Controller } from "./controller.js";

export class PlayerController extends Controller {
  constructor(model, keys) {
    super(model);

    console.log(keys);

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

    this._model.move(moveX, moveZ);
  }
}