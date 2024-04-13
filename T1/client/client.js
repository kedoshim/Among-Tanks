import { loadConfig, getConfig } from "./config.js";
import InputListener from "./input/inputListener.js";
import Game from "./game.js";

window.addEventListener("gamepadconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = gamepad.index;
  console.log("gamepad " + gamepad.index + " connected");
  // console.log(gamepad);
});

window.addEventListener("gamepaddisconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = null;
  console.log("gamepad " + gamepad.index + " disconnected");
});


let config = null;
async function configSetup() {
  await loadConfig();
  config = getConfig();
}

await configSetup();

let connectedGamepads = [null, null, null, null];

const socket = io();

let game = new Game()
let inputListener = new InputListener(document,config);

socket.on("connect", () => {
  try {
    for (let i; i < config.numberOfPlayers; i++) {
      const playerId = socket.id + "." + i;
      console.log(`Player connected on Client with id: ${playerId}`);
    }

    // renderScreen(screen, game, requestAnimationFrame, playerId);
  } catch (error) {
    console.log(`Error on connect: ${error}`);
  }

});

socket.on("setup", (state) => {
  console.log(state);
  game.createGame(state);
  game.render()

  for (let i; i < config.numberOfPlayers; i++) {
    const playerId = socket.id + "." + i;
    // keyboardListener.registerPlayerId(playerId);
  }

  // inputListener.subscribe(game.movePlayer);
  inputListener.subscribe((command) => {
    // socket.emit("move-player", command);
  });
});

socket.on("add-player", (command) => {
  console.log(`Receiving ${command.type} -> ${command.playerId}`);
  game.addPlayer(command);
});

socket.on("remove-player", (command) => {
  console.log(`Receiving ${command.type} -> ${command.playerId}`);
  game.removePlayer(command);
});

socket.on("move-player", (command) => {
  console.log(`Receiving ${command.type} -> ${command.playerId}`);

  const playerId = socket.id;

  if (playerId !== command.playerId) {
    game.movePlayer(command);
  }
});



function manageOrbitControls() {
  if (keyboard.down("O")) {
    cameraController.changeCameraMode();
  }
}


