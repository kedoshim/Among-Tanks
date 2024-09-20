import { createRoom, fetchAvailableRooms, joinRoom } from "./client.js";

let roomCount = 0;

var rooms = {}

let isCreatingRoom = false

document.getElementById("create-room").addEventListener("click", function () {
    
    let id = createRoom()
    joinRoom(id)
});

function createRoomDiv(id) {
    console.log(id)
    if (!rooms[id]) {
        
    // console.log(id);
    rooms[id] = true;
    roomCount++;
    const roomList = document.getElementById("room-list");
    const newRoom = document.createElement("div");
    newRoom.classList.add("room");
    newRoom.textContent = `Room ${id}`;
    roomList.appendChild(newRoom);}
}




setInterval(async () => {
    let roomsData = await fetchAvailableRooms()
    
    for (var room in roomsData) {
        createRoomDiv(room)
    }
},1000)
