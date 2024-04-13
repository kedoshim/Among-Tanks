import { Controller } from "./controller.js";
import KeyboardState from "../../public/util/KeyboardState.js";
import { Tank } from "../tanks/tank.js";

import { getConfig } from "../../config.js";

/**
 * Represents the controller used by the player
 */
export class PlayerController extends Controller {
  /**
   * Creates an instance of PlayerController.
   *
   * @constructor
   */
  constructor(target) {
    super(target);
  }

  /**
   * Movement mode where the movement is based on the input direction
   * Called when "directionalMovement" is enabled in the config.json
   */
  _directionalMovement(keyboard, gamepad) {
    if (movement.shoot == true) {
      this._target.shoot();
    }
    this._target.moveRotating(movement.moveZ, movement.moveX);
  }

  /**
   * Movement mode where the left and right inputs make the player rotate
   * Called when "directionalMovement" is disabled in the config.json
   */
  _rotatingMovement(movement) {
    if (movement.shoot == true) {
      this._target.shoot();
    }
    this._target.moveRotating(movement.moveZ, movement.moveX);
  }

  /**
   */
  control(movement) {
    if (this._directionalMovementEnabled) {
      this._directionalMovement(movement);
    } else {
      this._rotatingMovement(movement);
    }
  }
}
