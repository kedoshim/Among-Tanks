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
            this.rooms[id] = {
                creation_date: new Date().toLocaleString(),
                creation_user: user_id,
                devices_connected: 0,
                devices_ids: [],
            };

            console.log(
                `> Player '${user_id}' created new room with id '${id}':`
            );
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
        } else {
            console.log("Room already exists");
        }
    }

    async avaliableRooms() {
        const availableRooms = Object.keys(this.rooms);
        return this.rooms;

        let roomsList = [];

        for (let i = 0; i < availableRooms.length; i++) {
            let roomId = availableRooms[i];
            let room = this.rooms[roomId];

            roomsList.push(room);
        }

        if (JSON.stringify(roomsList) !== JSON.stringify(this.previousState)) {
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
        if (this.rooms[id]) {
            if (!this.rooms[id].devices_ids.includes(user_id)) {
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

    async leave(room_id, device_id) {
        // Check if the room exists
        if (this.rooms[room_id]) {
            // Check if the device is in the room
            const deviceIndex =
                this.rooms[room_id].devices_ids.indexOf(device_id);
            if (deviceIndex !== -1) {
                // Remove the device from the room
                this.rooms[room_id].devices_ids.splice(deviceIndex, 1);
                this.rooms[room_id].devices_connected -= 1;

                console.log(
                    `> Device '${device_id}' left room ${room_id}. Devices connected: ${this.rooms[room_id].devices_connected}`
                );

                // Optionally: If no devices are left, consider removing the room
                if (this.rooms[room_id].devices_connected === 0) {
                    // console.log(
                    //     `> No devices left in room '${room_id}', consider closing room.`
                    // );
                    // You could delete the room like this:
                    delete this.rooms[room_id];
                }
            } else {
                console.log(
                    `Device '${device_id}' is not in room '${room_id}'`
                );
            }
        } else {
            console.log(`Room '${room_id}' does not exist`);
        }
    }
}

export default Rooms;

