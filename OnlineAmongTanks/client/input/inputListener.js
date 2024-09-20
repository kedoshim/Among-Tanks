// InputListener.js
import KeyboardListener from "./keyboardListener.js";
import GamepadListener from "./gamepadListener.js";

export default class InputListener {
  constructor(document, config) {
    this.keyboardListener = new KeyboardListener(document, config);
    this.gamepadListener = new GamepadListener(config);

    this.observers = [];
  }

  subscribe(observerFunction) {
    this.observers.push(observerFunction);
    this.keyboardListener.subscribe(observerFunction);
    this.gamepadListener.subscribe(observerFunction);
  }

  destroy() {
    this.keyboardListener.destroy();
    // GamepadListener doesn't have a destroy method, but you can add one if needed
  }
}
