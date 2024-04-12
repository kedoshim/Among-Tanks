import express from "express";
import http from "http";

import { Server } from "socket.io";

import Game from "./game.js";

const app = express();
const server = http.createServer(app);
const sockets = new Server(server);

app.use(express.static("../../client"));

const game = new Game();
game.createGame();
// game.start();

// game.subscribe((command) => {
//   console.log(`> Emitting ${command.type}`);
//   sockets.emit(command.type, command);
// });

sockets.on("connection", (socket) => {
  const playerId = socket.id;
  console.log(`> Player connected: ${playerId}`);

  game.addPlayer({ playerId: playerId });

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId: playerId });
    console.log(`> Player disconnected: ${playerId}`);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";

    // pla.movePlayer(command);
    console.log(`Move Player ${playerId}`)
  });
});

server.listen(3000, () => {
  console.log(`> Server listening on port: 3000`);
});