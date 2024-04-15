import { Controller } from "./controller.js";
import KeyboardState from "../../../libs/util/KeyboardState.js";
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
   * @param {Tank} target
   * @param {*} keyboardKeys
   * @param {{ up: number; down: number; left: number; right: number; shoot: number; }} [gamepadButtons=""]
   */
  constructor(target, keyboardKeys, gamepadButtons = "") {
    const config = getConfig();
    const gamepadConfig = config.gamepadConfig;

    super(target);

    this._keys = keyboardKeys;

    if (gamepadButtons === "") {
      this._buttons = gamepadConfig.defaultGamepadButtons;
    } else {
      this._buttons = gamepadButtons;
    }
    this._directionalMovementEnabled = config.directionalMovementEnabled;
    this._deadzone = gamepadConfig.deadzone;
    this._stickMultiplier = gamepadConfig.stickMultiplier
  }

  set upKey(key) {
    this._keys.up = key;
  }

  set downKey(key) {
    this._keys.down = key;
  }

  set leftKey(key) {
    this._keys.left = key;
  }

  set rightKey(key) {
    this._keys.right = key;
  }

  set shootKey(keys) {
    if (!Array.isArray(keys)) {
      // shoot must be an array
      this._keys.shoot = [keys];
    } else {
      this._keys.shoot = keys;
    }
  }

  set upButton(button) {
    this._buttons.up = button;
  }

  set downButton(button) {
    this._buttons.down = button;
  }

  set leftButton(button) {
    this._buttons.left = button;
  }

  set rightButton(button) {
    this._buttons.right = button;
  }

  set shootButton(buttons) {
    if (!Array.isArray(buttons)) {
      // shoot must be an array
      this._buttons.shoot = [buttons];
    } else {
      this._buttons.shoot = buttons;
    }
  }

  // Getter for all keys
  get keys() {
    return this._keys;
  }

  // Getter for all buttons
  get buttons() {
    return this._buttons;
  }

  /**
   * Reads the config.json file and returns if the directional movement is enabled   *
   * @async
   * @returns {boolean}
   */
  async isDirectionalMovement() {
    if (this._readConfig == true) {
      return this._directionalMovementEnabled;
    }

    const config = await fetch("./config.json");
    const json = await config.json();

    this._directionalMovementEnabled = json.directionalMovementEnabled;

    this._readConfig = true;
    return this._directionalMovementEnabled;
  }
  /**
   * Movement mode where the movement is based on the input direction
   * Called when "directionalMovement" is enabled in the config.json
   */
  _directionalMovement(keyboard, gamepad) {
    var moveX = 0;
    var moveZ = 0;

    // Check movement direction based on pressed keys
    if (keyboard.pressed(this._keys.up)) {
      moveZ--;
    }
    if (keyboard.pressed(this._keys.down)) {
      moveZ++;
    }
    if (keyboard.pressed(this._keys.left)) {
      moveX--;
    }
    if (keyboard.pressed(this._keys.right)) {
      moveX++;
    }

    this._keys.shoot.every((key, index) => {
      if (keyboard.down(key)) {
        this._target.shoot();
        return false;
      } else {
        return true;
      }
    });

    if (gamepad) {
      // console.log(gamepad);
      const gamepadButtons = gamepad.buttons;
      const gamepadAxes = gamepad.axes;
      // Check movement direction based on pressed keys
      if (gamepadButtons[this._buttons.up].value == 1) {
        moveZ--;
      }
      if (gamepadButtons[this._buttons.down].value > 0) {
        moveZ++;
      }
      if (gamepadButtons[this._buttons.left].value > 0) {
        moveX--;
      }
      if (gamepadButtons[this._buttons.right].value > 0) {
        moveX++;
      }

      if (gamepadButtons[this._buttons.shoot].value > 1) {
        this._target.shoot();
      }

      // Sticks

      if (gamepadAxes[1] > this._deadzone || gamepadAxes[1] < -this._deadzone)
        moveZ += gamepadAxes[1] * this._stickMultiplier;
      if (gamepadAxes[0] > this._deadzone || gamepadAxes[0] < -this._deadzone)
        moveX += gamepadAxes[0] * this._stickMultiplier;
    }

    this._target.moveDirectional(moveX, moveZ);
  }

  /**
   * Movement mode where the left and right inputs make the player rotate
   * Called when "directionalMovement" is disabled in the config.json
   */
  _rotatingMovement(keyboard, gamepad) {
    var rotation = 0;
    var movement = 0;

    // Check rotation direction based on pressed keys
    if (keyboard.pressed(this._keys.up)) {
      movement++;
      this._target._inMovement = true;
      this._target._positiveMovement = true;
    }
    if (keyboard.pressed(this._keys.down)) {
      movement--;
      this._target._inMovement = true;
      this._target._positiveMovement = false;
    }
    if (keyboard.pressed(this._keys.left)) {
      rotation++;
    }
    if (keyboard.pressed(this._keys.right)) {
      rotation--;
    }

    this._keys.shoot.every((key, index) => {
      if (keyboard.down(key)) {
        this._target.shoot();
        return false;
      } else {
        return true;
      }
    });

    if (gamepad) {
      const gamepadButtons = gamepad.buttons;
      const gamepadAxes = gamepad.axes;
      // Check movement direction based on pressed keys
      if (gamepadButtons[this._buttons.up].value == 1) {
        movement--;
      }
      if (gamepadButtons[this._buttons.down].value > 0) {
        movement++;
      }
      if (gamepadButtons[this._buttons.left].value > 0) {
        rotation--;
      }
      if (gamepadButtons[this._buttons.right].value > 0) {
        rotation++;
      }

      if (gamepadButtons[this._buttons.shoot].value > 1) {
        this._target.shoot();
      }

      // Sticks

      //left stick y axis
      if (gamepadAxes[1] > this._deadzone || gamepadAxes[1] < -this._deadzone) {
        movement -= gamepadAxes[1] * this._stickMultiplier;
      }
      //right stick x axis
      if (gamepadAxes[2] > this._deadzone || gamepadAxes[2] < -this._deadzone) {
        rotation -= gamepadAxes[2] * this._stickMultiplier;
      }
    }
    // makes so it always uses the directional movement mode if using the gamepad
    this._target.moveRotating(movement, rotation);
  }

  /** 
   * @async
   * @param {KeyboardState} keyboard The keyboard assigned to the player
   * @param {Gamepad} [gamepad=null] The gamepad assigned to the player
   */
  async control(keyboard, gamepad = null) {
    if (await this.isDirectionalMovement()) {
      this._directionalMovement(keyboard, gamepad);
    } else {
      this._rotatingMovement(keyboard, gamepad);
    }
  }
}

