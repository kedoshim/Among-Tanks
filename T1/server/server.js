import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

import Game from "./game.js";
import { getNextLevel, loadLevels } from "./levels.js";
import geckos from "@geckos.io/server"
import Rooms from './rooms.js'

const app = express();
const server = http.createServer(app);
const sockets = geckos()

sockets.listen(3001)

// // Middleware to log incoming requests
// app.use((req, res, next) => {
//   console.log(`Requested URL: ${req.url}`);
//   next(); // Call next() to pass the request to the next middleware/route handler
// });

// Serve static files from the "client" directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "./T1/client")));

await loadLevels();

const game = new Game();
game.levelMap = getNextLevel();
game.run();

// game.start();

// game.subscribe((command) => {
//   console.log(`> Emitting ${command.type}`);
//   sockets.emit(command.type, command);
// });

const rooms = new Rooms();

app.get('/avaliableRooms', async (req, res) => {
  return res.json(await rooms.avaliableRooms())
})

sockets.onConnection((socket) => {

  const playerId = socket.id;
  console.log(`> Device connected: ${playerId}`);
  let ping = 0;

  socket.on("ping", (timestamp) => {
    const pongTimestamp = Date.now();
    ping = pongTimestamp - timestamp;
    socket.emit("pong", { ping });
  });

  socket.on("create-players", (command) => {
    console.log(`> Creating players of device ${playerId}`)
    game.createPlayers(command.players);

    socket.emit("setup", game.encodedGamestate);
  });

  socket.onDisconnect(() => {
    game.removeDevice({ playerId: playerId });
    console.log(`> Player disconnected: ${playerId}`);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";

    game.insertMovement(command);
  });
  
  game.subscribe((command) => {
    socket.emit("update", command);
  });

  socket.on("create-room", (command) => {
    console.log(command)
    socket.join(command.room_id)
    rooms.create(command.room_id, socket.id)
  })

  socket.on("join_room", (command) => {
    rooms.join(command.room_id)
  })


});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`> Server listening on port: ${PORT}`);
});
