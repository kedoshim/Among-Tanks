import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  SecondaryBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

import {
  createAmogus,
  addTank,
  addBlowgun,
  addHelmet,
} from "./playerModels.js";

const NumberOfPlayers = 4;

let players = [];
let controllers = [];


const playerAmogusColors = ["dimgray", "antiquewhite", "purple", "pink"];
const playerTankColors = ["darkblue", "red", "goldenrod", "green"];
const playerSpawnPoint = [
  [-20, -20],
  [20, -20],
  [-20, 20],
  [20, 20],
];
let playerControls = [
  {
    up: "W",
    down: "S",
    right: "D",
    left: "A",
    shoot: ["Space", "Q", "LeftShift"],
  },
  {
    up: "up",
    down: "down",
    right: "right",
    left: "left",
    shoot: ["/", ","],
  },
  {
    up: "I",
    down: "K",
    right: "L",
    left: "J",
    shoot: ["H"],
  },
  {
    up: "h", //NumPad8
    down: "e", //NumPad5
    right: "f", //NumPad6
    left: "d", //NumPad4
    shoot: ["Enter"],
  },
];

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 30, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// Use to scale the amog
var scale = 1.0;

// Show text information onscreen
showInformation();

// To use the keyboard
var keyboard = new KeyboardState();

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(100, 100);
scene.add(plane);

for (let i = 0; i < NumberOfPlayers; i++) {
  createPlayer();
}

var positionMessage = new SecondaryBox("");
positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu");

loadPlayers();

render();

function createPlayer() {
  const playerNumber = players.length;
  const amogColor = playerAmogusColors[playerNumber];
  const tankColor = playerTankColors[playerNumber];

  console.log("creating player " + (playerNumber + 1));

  let amog = createAmogus(0, 0, amogColor);
  addTank(amog, tankColor);
  addBlowgun(amog, tankColor);
  addHelmet(amog, tankColor);

  // var cubeAxesHelper = new THREE.AxesHelper(9);
  // amog.add(cubeAxesHelper);

  players.push(amog);
  console.log(players);
}

function loadPlayers() {
  let i = 0;
  players.forEach((player) => {
    console.log("loading player " + (i + 1));
    scene.add(player);
    setPlayerSpawn(i, player);
    addPlayerControls(i,player);
    i++;
  });
}

function setPlayerSpawn(playerNumber, player) {
  const [x, z] = playerSpawnPoint[playerNumber];
  player.position.x = x;
  player.position.z = z;
}

function addPlayerControls(playerNumber, player) {
  const controller = function () {
    if (keyboard.pressed(playerControls[playerNumber].up)) player.translateZ(1);
    if (keyboard.pressed(playerControls[playerNumber].down)) player.translateZ(-1);
    if (keyboard.pressed(playerControls[playerNumber].right)) player.translateX(-1);
    if (keyboard.pressed(playerControls[playerNumber].left)) player.translateX(1);
    
    // alreadyShot = false;
    // playerControls[playerNumber].shoot.forEach((key) => {
    //   if (keyboard.pressed(key) && !alreadyShot) {
    //     player.shoot();
    //     alreadyShot = true;
    //   }
    // });

    // updatePositionMessage(player);
  }
  controllers.push(controller);
}

function keyboardUpdate() {
  keyboard.update();
  controllers.forEach((controller) =>controller())
}

function updatePositionMessage(player) {
  var str =
    "POS {" +
    player.position.x.toFixed(1) +
    ", " +
    player.position.y.toFixed(1) +
    ", " +
    player.position.z.toFixed(1) +
    "} " +
    "| SCL {" +
    player.scale.x.toFixed(1) +
    ", " +
    player.scale.y.toFixed(1) +
    ", " +
    player.scale.z.toFixed(1) +
    "} " +
    "| ROT {" +
    player.rotation.x.toFixed(1) +
    ", " +
    player.rotation.y.toFixed(1) +
    ", " +
    player.rotation.z.toFixed(1) +
    "}";
  positionMessage.changeMessage(str);
}

function showInformation() {
  // Use this to show information onscreen
  var controls = new InfoBox();
  controls.add("Geometric Transformation");
  controls.addParagraph();
  controls.add("Use keyboard arrows to move the amog in XY.");
  controls.add("Press Page Up or Page down to move the amog over the Z axis");
  controls.add("Press 'A' and 'D' to rotate.");
  controls.add("Press 'W' and 'S' to change scale");
  controls.show();
}

function render() {
  keyboardUpdate();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera); // Render scene
}
