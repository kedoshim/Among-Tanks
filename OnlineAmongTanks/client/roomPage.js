import { createRoom, fetchAvailableRooms, joinRoom } from "./client.js";
import { preloadCommonTankModel } from "./entities/tanks/models/common_tank_model.js";

let roomCount = 0;
var rooms = {};
let isCreatingRoom = false;

let previousData = {};
let modelPreloaded = false;

document.getElementById("create-room").addEventListener("click", function () {
    while (modelPreloaded === false) {
        modelPreloaded = preloadCommonTankModel();
    }
    let id = createRoom();
    joinRoom(id);
});

function updateRoomDiv(id, devicesConnected) {
    const existingRoomDiv = document.getElementById(`room-${id}`);

    if (existingRoomDiv) {
        // If the room div already exists, update its content
        existingRoomDiv.textContent = `Room ${id} - Devices Connected: ${devicesConnected}`;
    } else {
        // Otherwise, create a new room div
        createRoomDiv(id, devicesConnected);
    }
}

function createRoomDiv(id, devicesConnected) {
    // Se a sala ainda não foi criada, adiciona-a à lista de salas
    if (!rooms[id]) {
        rooms[id] = true;
        roomCount++;

        const roomList = document.getElementById("room-list");
        const newRoom = document.createElement("div");
        newRoom.classList.add("room");
        newRoom.id = `room-${id}`; // Assign unique id to the div for easy reference

        // Adiciona o ID da sala e o número de dispositivos conectados na div
        newRoom.textContent = `Room ${id} - Devices Connected: ${devicesConnected}`;

        // Adiciona um evento de clique para ingressar na sala quando a div for clicada
        newRoom.addEventListener("click", function () {
            joinRoom(id);
        });

        roomList.appendChild(newRoom);
    }
}

function deleteRoomDiv(id) {
    const roomDiv = document.getElementById(`room-${id}`);
    if (roomDiv) {
        roomDiv.remove(); // Remove the div from the DOM
        console.log(`Room ${id} was removed from the DOM`);
    }
}

setInterval(async () => {
    if (!modelPreloaded) {
        modelPreloaded = preloadCommonTankModel();
        return;
    }

    let roomsData = await fetchAvailableRooms();

    // Store the current state before updating previousData
    const currentRoomIds = Object.keys(roomsData);

    // Check for removed rooms before updating previousData
    for (let room in previousData) {
        if (!currentRoomIds.includes(room)) {
            // If a room was in previousData but not in current roomsData, remove it
            deleteRoomDiv(room);
            delete rooms[room]; // Optionally remove the room from the rooms object
        }
    }

    // Now update previousData with the latest roomsData
    previousData = roomsData;

    // Iterate over each room in roomsData
    for (let room in roomsData) {
        // Get the number of devices connected to the room
        let devicesConnected = roomsData[room].devices_connected;

        // Update or create the room div
        updateRoomDiv(room, devicesConnected);
    }
}, 1000);
