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
const playerAmogusColors = ["dimgray", "antiquewhite", "purple", "pink"];
const playerTankColors = ["darkblue", "red", "goldenrod", "green"];
const playerSpawnPoint = [ [-20, -20], [20, -20], [-20, 20], [20, 20] ];

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

for (let i = 0; i < NumberOfPlayers; i++){
  createPlayer();
}

var positionMessage = new SecondaryBox("");
positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu");

loadPlayers();

render();

function createPlayer() {
  
  const playerNumber = players.length
  const amogColor = playerAmogusColors[playerNumber];
  const tankColor = playerTankColors[playerNumber];

  console.log("creating player " + (playerNumber + 1));

  let amog = createAmogus(0, 0, amogColor);
  addTank(amog,tankColor);
  addBlowgun(amog,tankColor);
  addHelmet(amog, tankColor);

  var cubeAxesHelper = new THREE.AxesHelper(9);
  amog.add(cubeAxesHelper);

  players.push(amog);
  console.log(players);
}

function loadPlayers() {
  let i = 0;
  console.log(players);
  players.forEach((player) => {
    console.log("loading player " + (i + 1));
    scene.add(player);
    setPlayerSpawn(i, player);
    // addPlayerControls(i,player);
    i++;
  })
}

function setPlayerSpawn(playerNumber, player) {
  const [x, z] = playerSpawnPoint[playerNumber];
  player.position.x = x;
  player.position.z = z;
}

function keyboardUpdate() {
  keyboard.update();
  if (keyboard.pressed("S")) amog.translateZ(-1);
  if (keyboard.pressed("W")) amog.translateZ(1);
  if (keyboard.pressed("up")) amog.translateY(1);
  if (keyboard.pressed("down")) amog.translateY(-1);
  if (keyboard.pressed("pageup")) amog.translateZ(1);
  if (keyboard.pressed("pagedown")) amog.translateZ(-1);

  let angle = THREE.MathUtils.degToRad(5);
  if (keyboard.pressed("A")) amog.rotateY(angle);
  if (keyboard.pressed("D")) amog.rotateY(-angle);
  updatePositionMessage();
}

function updatePositionMessage() {
  var str =
    "POS {" +
    amog.position.x.toFixed(1) +
    ", " +
    amog.position.y.toFixed(1) +
    ", " +
    amog.position.z.toFixed(1) +
    "} " +
    "| SCL {" +
    amog.scale.x.toFixed(1) +
    ", " +
    amog.scale.y.toFixed(1) +
    ", " +
    amog.scale.z.toFixed(1) +
    "} " +
    "| ROT {" +
    amog.rotation.x.toFixed(1) +
    ", " +
    amog.rotation.y.toFixed(1) +
    ", " +
    amog.rotation.z.toFixed(1) +
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
  // keyboardUpdate();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera); // Render scene
}
