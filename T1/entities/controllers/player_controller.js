import { Controller } from "./controller.js";

/**
 * Represents the controller used by the player
 */
export class PlayerController extends Controller {
  static defaultGamepadButtons = {
    //left axis for movement too

    up: 12, // dpad up
    down: 13, // dpad down
    left: 14, // dpad left
    right: 15, // dpad right
    shoot: 0, //A
  };
  constructor(target, keyboardKeys, gamepadButtons = "") {
    super(target);

    // console.log(keyboardKeys);

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

  async isCoolMovement() {
    if (this._readConfig == true) {
      return this._coolMovementEnabled;
    }
    

    const config = await fetch("./config.json");
    const json = await config.json();

    this._coolMovementEnabled = json.coolMovementEnabled;

    this._readConfig = true;
    return this._coolMovementEnabled;
  }

  coolMovement(keyboard, gamepad) {
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
      if (keyboard.pressed(key)) {
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

  rotatingMovement(keyboard, gamepad) {
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
      if (keyboard.pressed(key)) {
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
    // makes so it always uses the cool movement mode if using the gamepad
    this._target.moveRotating(movement, rotation);
  }

  async control(keyboard, gamepad = null) {
    if (await this.isCoolMovement()) {
      this.coolMovement(keyboard, gamepad);
    }
    else {
      this.rotatingMovement(keyboard, gamepad);
    }

  }
}
