import KeyboardState from "../../../../libs/util/KeyboardState.js";
import { Tank } from "../tanks/tank.js";

/**
 * Represent any algorithm used to control an Entity
 */
export class Controller {
  /**
   * Creates an instance of Controller.
   *
   * @constructor
   * @param {Tank} target The object that should be controlled
   */
  constructor(target) {
    this._target = target;
  }

  /**
   * sets Controller's target
   * @type {Tank}
   */
  set target(target) {
    this._target = target;
  }

  /**
   * Makes 'target' act according to the provided inputs
   *
   * @param {KeyboardState} keyboard The keyboard assigned to the target
   * @param {Gamepad} [gamepad=null] The gamepad assigned to the target
   */
  control(keyboard, gamepad = null) {}
}
