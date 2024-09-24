import { createRoom, fetchAvailableRooms, joinRoom } from "./client.js";
import { preloadCommonTankModel } from "./entities/tanks/models/common_tank_model.js";

let roomCount = 0;
var rooms = {};
let isCreatingRoom = false;

let previousData = []
let modelPreloaded = false;

document.getElementById("create-room").addEventListener("click", function () {
    while (modelPreloaded === false) {
        modelPreloaded = preloadCommonTankModel();
    }
    let id = createRoom();
    joinRoom(id);
});

function createRoomDiv(id) {
    // If the room has not been created yet, add it to the rooms list
    if (!rooms[id]) {
        rooms[id] = true;
        roomCount++;
        
        const roomList = document.getElementById("room-list");
        const newRoom = document.createElement("div");
        newRoom.classList.add("room");
        newRoom.textContent = `Room ${id}`;
        
        // Add click event to join the room when the div is clicked
        newRoom.addEventListener("click", function () {
            joinRoom(id);
        });
        
        roomList.appendChild(newRoom);
    }
}

setInterval(async () => {
    if (!modelPreloaded) {
        modelPreloaded = preloadCommonTankModel();
        return
    }
    let roomsData = await fetchAvailableRooms();
    
    // Compare stringified versions of the arrays to check if they have different content
    if (JSON.stringify(roomsData) !== JSON.stringify(previousData)) {
        console.log(roomsData);
        previousData = roomsData; // Update previousData to the latest roomsData
    }
    
    for (var room in roomsData) {
        createRoomDiv(room);
    }
}, 1000);
