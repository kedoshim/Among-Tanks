import { Object3D } from "../../../build/three.module.js";
import KeyboardState from "../../../libs/util/KeyboardState.js";

/**
 * Represent any algorithm used to control an Entity
 */
export class Controller {
  /**
   * Creates an instance of Controller.
   *
   * @constructor
   * @param {Object3D} target The object that should be controlled
   */
  constructor(target) {
    this._target = target;
  }

  /**
   * sets Controller's target
   * @type {Object3D}
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
