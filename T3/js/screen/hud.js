import { darkenColor, isMobile } from "../utils.js";


export function addPlayerToHud(index, hexAmogColor, hexTankColor, mobile = false) {
    let hudDiv = document.getElementById("hud");
    if(isMobile()) {
        hudDiv = document.getElementById("hud-mobile");
    }
    let playerDiv = document.createElement("div");
    playerDiv.className = "player";
    playerDiv.id = `div-p${index}`;
    
    createAmogusProfile(hexAmogColor,hexTankColor, index, playerDiv);
    createHealthbar(index, playerDiv, isMobile());

    hudDiv.appendChild(playerDiv);
}

export function updatePlayerHud(index, lifePercent) {
    let playerHealthBarInside = document.getElementById(`life-bar-p${index}`);
    if(playerHealthBarInside)
        playerHealthBarInside.style.width = lifePercent + "%";
}

export function resetHud() {
    console.log(isMobile())
    if(isMobile()) {
        let hudDiv = document.getElementById("hud-mobile");
        hudDiv.innerHTML = "";
    }
    else {
        let hudDiv = document.getElementById("hud");
        hudDiv.innerHTML = "";
    }
}

function createAmogusProfile(hexColor,hexTankColor, index, div, mobile) {
    const svgUrl = "./assets/svg/Amogus.svg"; // Path to your SVG file
    const bodyColor = "#3f5aa8"; // Color to replace
    const capColor = "#3d472e"; // Color to replace
    const shadowColor = "#666766";
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
                else if (el.getAttribute("fill") === capColor) {
                    el.setAttribute("fill", darkenColor(hexTankColor,0.7));
                }
                else if (el.getAttribute("fill") === shadowColor) {
                    el.setAttribute("fill", darkenColor(newColor,0.8));
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

function createHealthbar(index, div, mobile = false) {
    let healthBar = document.createElement("div");
    healthBar.className = "life-bar";
    if(mobile) {
        healthBar.className = "life-bar-mobile";
    }
    let healthBarInside = document.createElement("div");
    healthBarInside.id = `life-bar-p${index}`;
    healthBarInside.className = `life-bar-value`;

    healthBar.appendChild(healthBarInside);
    div.appendChild(healthBar);
}

export function createNipple() {
    // const options = {
    //     zone: document.getElementById('nipple-container'),
    //     size: 120,
    //     multitouch: false,
    //     maxNumberOfNipples: 2,
    //     mode: 'static',
    //     restJoystick: true,
    //     shape: 'circle',
    //     // position: { top: 20, left: 20 },
    //     position: { bottom: '60px', left: '100px' },
    //     dynamicPage: false,
    //   }
    let nipple = nipplejs.create({
		zone: document.getElementById('joystickWrapper1'),
		mode: 'static',			
		position: { top: '-80px', left: '80px' }
	});
    //nipple.prepareEvent = function (evt) { if (evt.target.className == 'front' || evt.target.className == 'back') evt.preventDefault(); return evt.type.match(/^touch/) ? evt.changedTouches : evt; };
    return nipple;
}