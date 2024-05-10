import { loadConfig, getConfig } from "./config.js";
import InputListener from "./input/inputListener.js";
import Game from "./game.js";

window.addEventListener("gamepadconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = gamepad.index;
  console.log("gamepad " + gamepad.index + " connected");
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

const socket = geckos({ port: 3001 });

let game = new Game()
let inputListener = new InputListener(document,config);

socket.onConnect(() => {
  try {
    let command = {};
    command.players = {};
    let players = [];
    for (let i = 1; i < config.numberOfPlayers + 1; i++) {
      const playerId = socket.id + "." + i;
      console.log(`Player connected on Client with id: ${playerId}`);
      command.players[playerId] = playerId;
      players.push(playerId);
    }
    game.mainPlayers = players;
    socket.emit("create-players", command);
  } catch (error) {
    console.log(`Error on connect: ${error}`);
  }

  setInterval(() => {
    const start = Date.now();
    socket.emit("ping", start);
  }, 1000);

  socket.on("pong", ({ ping }) => {
    const end = Date.now();
    // console.log(`Client Ping: ${ping}ms`);
  });

  socket.on("setup", (state) => {
    // console.log(state);
    game.createGame(state);
    game.render()
  
    for (let i; i < config.numberOfPlayers; i++) {
      const playerId = socket.id + "." + i;
      // keyboardListener.registerPlayerId(playerId);
    }
  
    // inputListener.subscribe(game.movePlayer);
    inputListener.subscribe((command) => {
      socket.emit("move-player", command);
    });
  });
  
  socket.on("update", (state) => {
    game.updateGamestate(state);
  })
});




function manageOrbitControls() {
  if (keyboard.down("O")) {
    cameraController.changeCameraMode();
  }
}


