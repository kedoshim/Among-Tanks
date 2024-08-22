import { darkenColor } from "../utils.js";

export function addPlayerToHud(index, hexAmogColor, hexTankColor) {
    let hudDiv = document.getElementById("hud");
    let playerDiv = document.createElement("div");
    playerDiv.className = "player";
    playerDiv.id = `div-p${index}`;
    
    createAmogusProfile(hexAmogColor,hexTankColor, index, playerDiv);
    createHealthbar(index, playerDiv);

    hudDiv.appendChild(playerDiv);
}

export function updatePlayerHud(index, lifePercent) {
    let playerHealthBarInside = document.getElementById(`life-bar-p${index}`);
    if(playerHealthBarInside)
        playerHealthBarInside.style.width = lifePercent + "%";
}

export function resetHud() {
    let hudDiv = document.getElementById("hud");
    hudDiv.innerHTML = "";
}

function createAmogusProfile(hexColor,hexTankColor, index, div) {
    const svgUrl = "./assets/svg/Amogus.svg"; // Path to your SVG file
    const bodyColor = "#3f5aa8"; // Color to replace
    const capColor = "#3d472e"; // Color to replace
    const newColor = hexColor; // New color

    fetch(svgUrl)
        .then((response) => response.text())
        .then((svgText) => {
            // Parse the SVG text into a DOM element
            let parser = new DOMParser();
            let svgDocument = parser.parseFromString(svgText, "image/svg+xml");
            let svgElement = svgDocument.documentElement;

            // Change all instances of the target color to the new color
            svgElement.querySelectorAll("*").forEach((el) => {
                if (el.getAttribute("fill") === bodyColor) {
                    el.setAttribute("fill", newColor);
                }
                if (el.getAttribute("fill") === capColor) {
                    el.setAttribute("fill", darkenColor(hexTankColor,0.7));
                }
            });

            // Create an img element and set its id
            let imgElement = document.createElement("img");
            imgElement.id = `profile-p${index}`;
            imgElement.className = "profile";
            imgElement.src =
                "data:image/svg+xml;base64," + btoa(svgElement.outerHTML);
            // div.innerHTML = '';  // Clear previous content
            div.appendChild(imgElement);
        })
        .catch((error) => console.error("Error fetching SVG:", error));
}

function createHealthbar(index, div) {
    let healthBar = document.createElement("div");
    healthBar.className = "life-bar";
    let healthBarInside = document.createElement("div");
    healthBarInside.id = `life-bar-p${index}`;
    healthBarInside.className = `life-bar-value`;

    healthBar.appendChild(healthBarInside);
    div.appendChild(healthBar);
}