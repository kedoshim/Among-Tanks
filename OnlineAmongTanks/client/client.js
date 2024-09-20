import { loadConfig, getConfig } from "./config.js";
import InputListener from "./input/inputListener.js";
import Game from "./game.js";
import { generateUUID } from "./public/three/src/math/MathUtils.js";
import { switchToGamePage } from "./mainPage.js";
// import { geckos } from "@geckos.io/server";

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

console.log(geckos);
const socket = geckos({ port: 3001 });



var id = "";
export function createRoom() {
  try {
      let room_id = generateUUID();
      socket.emit("create-room", {
        id: socket.id,
        room_id: room_id
      })
      console.log("Room created:", {
          id: socket.id,
          room_id: room_id,
      });
      return room_id 
    } catch (error) {
        console.error("Error creating room:", error);
    }
}

export function joinRoom(id) {
    socket.emit("join-room", {
        room_id: id,
        id: socket.id,
    });

    switchToGamePage()
}

export async function fetchAvailableRooms() {
    try {
        const response = await fetch("http://localhost:3000/avaliableRooms");
        const data = await response.json();
        return data
    } catch (error) {
        console.error("Erro:", error);
    }
}
socket.onConnect(() => {
  
  let game;

  // socket.emit("join_room", {
  //   "room_id": '0dcfdfcc-16af-4cd5-89d4-25985c865952'
  // });

  setInterval(() => {
    const start = Date.now();
    socket.emit("ping", start);
  }, 1000);

  socket.on("joined-room", async (data) => {
    try {
      console.log(`joined room ${data.room_id}`);
    
      game = new Game()
      await game.start()
      let inputListener = new InputListener(document, config);

      
      id = socket.id;

      let command = {};
      command.players = {};
      let players = [];
      for (let i = 1; i < config.numberOfPlayers + 1; i++) {
        const playerId = socket.id + "." + i;
        console.log(`Player connected on Client with id: ${playerId}`);
        command.players[playerId] = playerId;
        players.push(playerId);
      }
      command.room_id = data.room_id
      game.mainPlayers = players;
      socket.emit("create-players", command);
  } catch (error) {
    console.log(`Error on connect: ${error}`);
  }
  })

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
    if(!game)
      game.updateGamestate(state);
  })
});




function manageOrbitControls() {
  if (keyboard.down("O")) {
    cameraController.changeCameraMode();
  }
}


