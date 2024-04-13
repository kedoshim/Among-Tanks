// KeyboardListener.js
export default class KeyboardListener {
  constructor(document, config) {
    this.state = {
      observers: [],
      playerConfigs: config.playerConfig.defaultPlayerControls,
      pressedKeys: new Set(),
      keyInterval: null,
    };

    this.document = document;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);

    this.document.addEventListener("keydown", this.handleKeydown);
    this.document.addEventListener("keyup", this.handleKeyup);
  }

  subscribe(observerFunction) {
    this.state.observers.push(observerFunction);
  }

  notifyAll(commands) {
    for (const observerFunction of this.state.observers) {
      observerFunction(commands);
    }
  }

  handleKeydown(event) {
    const keyPressed = event.key;
    this.state.pressedKeys.add(keyPressed);

    // Start the interval if it's not already running
    if (!this.state.keyInterval) {
      this.state.keyInterval = setInterval(() => {
        this.handlePressedKeys();
      }, 15); // Adjust the interval duration as needed
    }
  }

  handleKeyup(event) {
    const keyPressed = event.key;
    this.state.pressedKeys.delete(keyPressed);

    // Stop the interval if no keys are pressed
    if (this.state.pressedKeys.size === 0 && this.state.keyInterval) {
      clearInterval(this.state.keyInterval);
      this.state.keyInterval = null;

      // Handle any remaining pressed keys immediately
      this.handlePressedKeys();
    }
  }

  handlePressedKeys() {
    const pressedKeys = this.state.pressedKeys;
    const playerConfigs = this.state.playerConfigs;

    const commands = [];
    for (let i = 0; i < playerConfigs.length && pressedKeys.size > 0; i++) {
      const playerConfig = playerConfigs[i];
      // console.log(pressedKeys);
      let moveX = 0;
      let moveZ = 0;
      let shoot = false;

      if (pressedKeys.has(playerConfig.up)) {
        moveZ++;
      }
      if (pressedKeys.has(playerConfig.down)) {
        moveZ--;
      }
      if (pressedKeys.has(playerConfig.left)) {
        moveX++;
      }
      if (pressedKeys.has(playerConfig.right)) {
        moveX--;
      }
      const shootKeys = playerConfig.shoot;
      const pressedKeysArray = Array.from(pressedKeys);

      shoot = shootKeys.some((key) => pressedKeysArray.includes(key));

      if (moveX != 0 || moveZ != 0 || shoot === true) {
        commands.push({
          type: "move",
          localPlayerId: i + 1,
          moveX,
          moveZ,
          shoot,
        });
      }
    }
    if (commands.length > 0) {
      this.notifyAll(commands);
      // console.log(commands);
    }
  }

  destroy() {
    this.document.removeEventListener("keydown", this.handleKeydown);
    this.document.removeEventListener("keyup", this.handleKeyup);
  }
}
