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

import { Player } from "./entities/player.js";

const NumberOfPlayers = 4;

let entities = [];
let players = [];
let connectedGamepads = [null, null, null, null];

const playerSpawnPoint = [
  [-20, -20],
  [20, -20],
  [-20, 20],
  [20, 20],
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
  let new_player = new Player();

  new_player.spawnPoint = playerSpawnPoint[Player.playerNumber - 1];

  players.push(new_player);
}

function loadPlayers() {
  players.forEach((entity) => {
    console.log("loading player " + entity.name);
    entity.load(scene);
  });
}

function keyboardUpdate() {
  keyboard.update();
  players.every((player, index) => {
    let playerGamepad = null;
    if (connectedGamepads[index] != null) {
      playerGamepad = navigator.getGamepads()[index];
      console.log("controller " + (index+1));
    } 
    player.runController(keyboard, playerGamepad);
    return true;
  });
  entities.forEach((entity) => {
    entity.runController();
  });
}

function showInformation() {
  // Use this to show information onscreen
  var controls = new InfoBox();
  controls.add("Geometric Transformation");
  controls.addParagraph();
  controls.add("Player - MOVE  SHOOT");
  controls.add("Player 1: WASD LeftShift");
  controls.add('Player 2: arrows ["," "/"]');
  controls.add("Player 3: IJKL    H");
  controls.add("Player 4: 8456    Enter");
  controls.show();
}

function render() {
  keyboardUpdate();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera); // Render scene
}

window.addEventListener("gamepadconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = gamepad.index;
  console.log("gamepad " + gamepad.index + " connected");
  console.log(gamepad);
});

window.addEventListener("gamepaddisconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = null;
  console.log("gamepad " + gamepad.index + " disconnected");
});
