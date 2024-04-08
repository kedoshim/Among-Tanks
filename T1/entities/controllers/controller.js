/**
 * Represent any algorithm used to control an Entity
 */
export class Controller {
  constructor(target) {
    this._target = target;
  }

  set target(target) {
    this._target = target;
  }

  control(keyboard,gamepad=null) {}
}
