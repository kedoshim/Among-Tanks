// GamepadListener.js
export default class GamepadListener {
  constructor(config) {
    this.state = {
      observers: [],
      playerConfigs: config.gamepadConfig.defaultGamepadButtons,
    };

    this.gamepadConnected = false;
    this.gamepadIndex = null;
    this.gamepadButtons = [];
    this.gamepadAxes = [];
    this.config = config;

    this.checkGamepadConnected = this.checkGamepadConnected.bind(this);
    this.updateGamepadState = this.updateGamepadState.bind(this);
    this.checkGamepadConnected();
  }

  subscribe(observerFunction) {
    this.state.observers.push(observerFunction);
  }

  notifyAll(command) {
    for (const observerFunction of this.state.observers) {
      observerFunction(command);
    }
  }

  checkGamepadConnected() {
    window.addEventListener("gamepadconnected", this.updateGamepadState);
    window.addEventListener("gamepaddisconnected", () => {
      this.gamepadConnected = false;
      this.gamepadIndex = null;
      this.gamepadButtons = [];
      this.gamepadAxes = [];
    });
  }

  updateGamepadState() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad && gamepad.index !== this.gamepadIndex) {
        this.gamepadIndex = gamepad.index;
        this.gamepadConnected = true;
        this.gamepadButtons = gamepad.buttons.map((button) => button.value);
        this.gamepadAxes = gamepad.axes.slice();
        this.handleGamepadInput();
        break;
      }
    }
    requestAnimationFrame(this.updateGamepadState);
  }

  handleGamepadInput() {
    const buttonsPressed = [];
    this.gamepadButtons.forEach((value, index) => {
      if (value >= this.config.gamepadConfig.deadzone) {
        buttonsPressed.push(index);
      }
    });

    const axes = this.gamepadAxes.map((axis, index) => {
      if (Math.abs(axis) < this.config.gamepadConfig.deadzone) {
        return 0;
      }
      return axis * this.config.gamepadConfig.stickMultiplier;
    });

    for (let i = 0; i < this.state.playerConfigs.length; i++) {
      const playerConfig = this.state.playerConfigs[i];
      const command = {
        up: axes[1] < 0,
        down: axes[1] > 0,
        left: axes[0] < 0,
        right: axes[0] > 0,
        shoot: buttonsPressed.includes(
          this.config.gamepadConfig.defaultGamepadButtons.shoot
        ),
        playerId: i + 1,
      };
      this.notifyAll(command);
    }
  }
}
