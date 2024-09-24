import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

import Game from "./game.js";
import { getNextLevel, loadLevels } from "./levels.js";
import geckos from "@geckos.io/server";
import Rooms from "./rooms.js";
import cors from "cors"; // Importando cors
import { v4 as uuidv4 } from "uuid";

const app = express();

const server = http.createServer(app);
const sockets = geckos();

sockets.listen(3001);

// Habilitar CORS para todas as origens
app.use(cors());

// Middleware para analisar o corpo das requisições como JSON
// app.use(express.json()); // Adicionado aqui

// Serve static files from the "client" directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "./OnlineAmongTanks/client")));
await loadLevels();

const rooms = new Rooms();

app.get("/avaliableRooms", async (req, res) => {
    //console.log(await rooms.avaliableRooms());
    return res.json(await rooms.avaliableRooms());
});

sockets.onConnection((socket) => {
    const playerId = socket.id;
    console.log(`> Device connected: ${playerId}`);
    let ping = 0;
    let game;

    var PlayerRoomId = ""

    socket.on("ping", (timestamp) => {
        const pongTimestamp = Date.now();
        ping = pongTimestamp - timestamp;
        socket.emit("pong", { ping });
    });

    socket.on("create-players", (command) => {
        console.log(`> Creating players of device ${playerId}`);
        game.createPlayers(command.players);

        // console.log(game);

        socket.emit("setup", game.encodedGamestate);
    });

    socket.onDisconnect(() => {
        // rooms.getGame(PlayerRoomId).removeDevice({ playerId: playerId });
        console.log(`> Player disconnected: ${playerId}`);
    });

    socket.on("move-player", (command) => {
        command.playerId = playerId;
        command.type = "move-player";
        // console.log(command);
        
        rooms.getGame(PlayerRoomId).insertMovement(command);
    });

    socket.on("create-room", (command) => {
        PlayerRoomId = command.room_id;
        // console.log(game)
        rooms.create(command.room_id, command.id, (data) => {
            socket.emit("update", data);
        });
        game = rooms.getGame(PlayerRoomId)
    });
    

    socket.on("join-room", (command) => {
        PlayerRoomId = command.room_id;
        rooms.join(command.room_id, command.id);
        
        game = rooms.getGame(command.room_id);
        game.subscribe((data) => {
            socket.emit("update", data);
        });

        socket.join(command.room_id);
        console.log(game)
        PlayerRoomId = command.room_id;
        socket.emit("joined-room",{room_id:command.room_id});
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`> Server listening on port: ${PORT}`);
});
