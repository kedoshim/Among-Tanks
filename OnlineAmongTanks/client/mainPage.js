export function switchToGamePage() {
    document.getElementById("create-room-page").style.display = "none";
    document.getElementById("game-page").style.display = "block";
}

// Function to switch to the create room page (optional if needed)
export function switchToCreateRoomPage() {
    document.getElementById("create-room-page").style.display = "flex";
    document.getElementById("game-page").style.display = "none";
}