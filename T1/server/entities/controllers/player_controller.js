import { Controller } from "./controller.js";
import KeyboardState from "../../../../libs/util/KeyboardState.js";
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

    this._directionalMovementEnabled = getConfig().directionalMovementEnabled
  }

  /**
   * Movement mode where the movement is based on the input direction
   * Called when "directionalMovement" is enabled in the config.json
   */
  _directionalMovement(movement,deltaTime) {
    if (movement.shoot == true) {
      this._target.shoot();
    }
    this._target.moveRotating(movement.moveZ, movement.moveX,deltaTime);
  }

  /**
   * Movement mode where the left and right inputs make the player rotate
   * Called when "directionalMovement" is disabled in the config.json
   */
  _rotatingMovement(movement,deltaTime) {
    if (movement.shoot == true) {
      this._target.shoot();
    }
    this._target.moveRotating(movement.moveZ, movement.moveX,deltaTime);
  }

  /**
   */
  control(movement, deltaTime) {
    // console.log(deltaTime)
    if (this._directionalMovementEnabled) {
      this._directionalMovement(movement,deltaTime);
    } else {
      this._rotatingMovement(movement,deltaTime);
    }
  }
}
