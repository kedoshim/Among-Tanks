import { Object3D } from "../../../build/three.module.js";
import { Controller } from "./controller.js";
import KeyboardState from "../../../libs/util/KeyboardState.js";

/**
 * Represents the controller used by the player
 */
export class PlayerController extends Controller {
  /**
   * The default Gamepad controller configuration
   *
   * @static
   * @type {{ up: number; down: number; left: number; right: number; shoot: number; }}
   */
  static defaultGamepadButtons = {
    //left axis for movement too

    up: 12, // dpad up
    down: 13, // dpad down
    left: 14, // dpad left
    right: 15, // dpad right
    shoot: 0, //A
  };
  /**
   * Creates an instance of PlayerController.
   *
   * @constructor
   * @param {Object3D} target
   * @param {*} keyboardKeys
   * @param {{ up: number; down: number; left: number; right: number; shoot: number; }} [gamepadButtons=""]
   */
  constructor(target, keyboardKeys, gamepadButtons = "") {
    super(target);

    this._keys = keyboardKeys;

    if (gamepadButtons === "") {
      this._buttons = PlayerController.defaultGamepadButtons;
    } else {
      this._buttons = gamepadButtons;
    }
    this._readConfig = false;
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
      const multiplyer = 1;
      const deadzone = 0.1;

      if (gamepadAxes[1] > deadzone || gamepadAxes[1] < -deadzone)
        moveZ += gamepadAxes[1] * multiplyer;
      if (gamepadAxes[0] > deadzone || gamepadAxes[0] < -deadzone)
        moveX += gamepadAxes[0] * multiplyer;
    }

    this._target.move(moveX, moveZ);
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
    }
    if (keyboard.pressed(this._keys.down)) {
      movement--;
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
      const multiplyer = 1;
      const deadzone = 0.1;

      //left stick y axis
      if (gamepadAxes[1] > deadzone || gamepadAxes[1] < -deadzone) {
        movement -= gamepadAxes[1] * multiplyer;
      }
      //right stick x axis
      if (gamepadAxes[2] > deadzone || gamepadAxes[2] < -deadzone) {
        rotation -= gamepadAxes[2] * multiplyer;
      }
    }
    // makes so it always uses the directional movement mode if using the gamepad
    this._target.moveRotating(movement, rotation);
  }

  /** 
   * @async
   * @param {KeyboardState} keyboard The keyboard assigned to the player
   * @param {Gamepad} [gamepad=null] The gamepad assigned to the player
   * @returns {null}
   */
  async control(keyboard, gamepad = null) {
    if (this.isDirectionalMovement()) {
      this._directionalMovement(keyboard, gamepad);
    } else {
      this._rotatingMovement(keyboard, gamepad);
    }
  }
}

