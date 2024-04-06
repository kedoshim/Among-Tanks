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

const amogColor = "rgb(250,210,0)";
const tankColor = "rgb(100,30,100)";
let amog = createAmogus(10, 0, 0, amogColor);


addTank(amog,tankColor);
addBlowgun(amog,tankColor);
addHelmet(amog, tankColor);

scene.add(amog);

var cubeAxesHelper = new THREE.AxesHelper(9);
amog.add(cubeAxesHelper);

var positionMessage = new SecondaryBox("");
positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu");

render();

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
  keyboardUpdate();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera); // Render scene
}
