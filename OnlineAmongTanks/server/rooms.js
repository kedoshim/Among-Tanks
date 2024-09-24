import Game from "./game.js";
import { getNextLevel } from "./levels.js";

class Rooms {
    constructor() {
        this.rooms = {}; // Store room data locally
        this.games = {}; // Store game instances locally
        this.previousState = [];
    }

    async create(id, user_id, update_command) {
        // Check if the room already exists
        if (!this.rooms[id]) {
            // Create a new room with the current timestamp and user
            this.rooms[id] = {
                creation_date: new Date().toLocaleString(),
                creation_user: user_id,
                devices_connected: 0,
                devices_ids: [],
            };

            console.log(`> Player '${user_id}' created new room with id '${id}':`);
            console.log(this.rooms[id]);

            let game = new Game();
            let level = getNextLevel();
            game.levelMap = getNextLevel();
            game.run();
            
            game.subscribe((command) => {
                update_command(command);
            });

            console.log(game);

            this.games[id] = game;

            // console.log("Rooms: ", JSON.stringify(this.rooms));
        } else {
            console.log("Room already exists");
        }
    }

    async avaliableRooms() {
        const availableRooms = Object.keys(this.rooms);
        return this.rooms;

        let roomsList = [];

        // Loop through each room and push its data to the list
        for (let i = 0; i < availableRooms.length; i++) {
            let roomId = availableRooms[i];
            let room = this.rooms[roomId];

            roomsList.push(room);
        }

        // Compare stringified versions of the arrays to check if they have different content
        if (JSON.stringify(roomsList) !== JSON.stringify(this.previousState)) {
            // console.log("Available Rooms: ", roomsList);
            this.previousState = roomsList; // Update previousData to the latest roomsData
        }

        return roomsList;
    }

    getGame(room_id) {
        if (this.games[room_id]) {
            return this.games[room_id];
        }
    }

    async join(id, user_id) {
        // Check if the room exists
        // console.log(this.rooms);
        if (this.rooms[id]) {
            if(!this.rooms[id].devices_ids.includes(user_id)) {
                // Increment the players connected count for the room
                this.rooms[id].devices_connected += 1;
                this.rooms[id].devices_ids.push(user_id);
                console.log(
                    `> Device '${user_id}' joined room ${id}. Devices connected: ${this.rooms[id].devices_connected}`
                );
            }
        } else {
            console.log("Room does not exist");
        }
    }
}

export default Rooms;
