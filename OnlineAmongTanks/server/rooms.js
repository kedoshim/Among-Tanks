import Game from "./game.js";
import { getNextLevel } from "./levels.js";

class Rooms {
    constructor() {
        this.rooms = {}; // Store room data locally
        this.games = {}; // Store game instances locally
    }

    async create(id, user_id, update_command) {
        // Check if the room already exists
        if (!this.rooms[id]) {
            // Create a new room with the current timestamp and user
            this.rooms[id] = {
                creation_date: new Date().toLocaleString(),
                creation_user: user_id,
                players_connected: 0,
                players_ids: [user_id],
            };

            let game = new Game();
            let level = getNextLevel();
            console.log(level);
            game.levelMap = getNextLevel();
            game.run();
            
            game.subscribe((command) => {
                update_command(command);
            });

            this.games[id] = game;

            console.log("Rooms: ", JSON.stringify(this.rooms));
        } else {
            console.log("Room already exists");
        }
    }

    async avaliableRooms() {
        const availableRooms = Object.keys(this.rooms);
        let roomsList = [];

        // Loop through each room and push its data to the list
        for (let i = 0; i < availableRooms.length; i++) {
            let roomId = availableRooms[i];
            let room = this.rooms[roomId];

            roomsList.push(room);
        }

        console.log("Available Rooms: ", roomsList);
        return roomsList;
    }

    getGame(room_id) {
        if (this.games[room_id]) {
            return this.games[room_id];
        }
    }

    async join(id, user_id) {
        // Check if the room exists
        if (this.rooms[id]) {
            // Increment the players connected count for the room
            this.rooms[id].players_connected += 1;
            this.rooms[id].players_ids.push(user_id);
            this.games[id].createPlayers(user_id);
            console.log(
                `Joined room ${id}. Players connected: ${this.rooms[id].players_connected}`
            );
        } else {
            console.log("Room does not exist");
        }
    }
}

export default Rooms;
