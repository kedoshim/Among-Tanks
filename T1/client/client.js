import io from 'socket.io'
import { getConfig } from './config';
import { PlayerController } from './entities/controllers/player_controller';

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

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

let config = null;
async function configSetup() {
  await loadConfig();
  config = getConfig();
}

let connectedGamepads = [null, null, null, null];

const socket = io()

socket.on("connect", () => {
  try {
    for (let i; i < config.numberOfPlayers; i++) {
      const playerId = socket.id + "."+i;
      console.log(`Player connected on Client with id: ${playerId}`);
    }

    // renderScreen(screen, game, requestAnimationFrame, playerId);
  }
  catch {
    console.log(`Error on connect: ${e}`)
  }

});

socket.on("setup", (state) => {
  game.setState(state);

  for (let i; i < config.numberOfPlayers; i++) {
    const playerId = socket.id + "." + i;
    keyboardListener.registerPlayerId(playerId);
  }
  
  keyboardListener.subscribe(game.movePlayer);
  keyboardListener.subscribe((command) => {
    socket.emit("move-player", command);
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



















await loadConfig();

const NumberOfPlayers = config.numberOfPlayers; //local players

  // Show text information onscreen
showInformation();

// To use the keyboard
var keyboard = new KeyboardState();
  
for (let i = 0; i < NumberOfPlayers; i++) {
  createPlayer();
}

var positionMessage = new SecondaryBox("");
positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu");

function manageOrbitControls() {
  if (keyboard.down("O")) {
    cameraController.changeCameraMode();
  }
}

function keyboardUpdate() {
  keyboard.update();
  manageOrbitControls();

  gameState.players.every((player, index) => {
    let playerGamepad = null;
    if (connectedGamepads[index] != null) {
      playerGamepad = navigator.getGamepads()[index];
      // console.log("controller " + (index+1));
    }
    player.runController(keyboard, playerGamepad);
    return true;
  });

  gameState.entities.forEach((entity) => {
    entity.runController();
  });
}

function showInformation() {
  // Use this to show information onscreen
  var controls = new InfoBox();
  controls.add("Geometric Transformation");
  controls.addParagraph();
  controls.add("Player - MOVE  SHOOT");
  controls.add("Player 1: WASD LeftShift");
  controls.add("Player 2: arrows [' , ', ' / ']");
  controls.add("Player 3: IJKL    H");
  controls.add("Player 4: 8456    Enter");
  controls.show();
}

function cameraUpdate() {
  cameraController.calculatePosition(gameState.players);
}
