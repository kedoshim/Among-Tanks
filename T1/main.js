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

const NumberOfPlayers = 2;

let entities = [];
let controllers = [];
let lastValidTargetAngle = [0, 0, 0, 0];

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

  new_player.spawnPoint = playerSpawnPoint[Player.playerNumber-1]

  entities.push(new_player);
}

function loadPlayers() {
  entities.forEach((entity) => {
    console.log("loading player " + entity.name);
    entity.load(scene)
  });
}

function keyboardUpdate() {
  keyboard.update();
  entities.forEach((entity) => entity.runController(keyboard));
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
