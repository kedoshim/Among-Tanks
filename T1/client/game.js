import * as THREE from "three";
import KeyboardState from "../../libs/util/KeyboardState.js";
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  SecondaryBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

import { CameraControls } from "./camera.js";
import { Player } from "./entities/player.js";

import { getConfig, loadConfig } from "./config.js";

// class Game{


let gameState = {
  scene,
  players : [],
  entities : [],
}

function setState(state) {
  this.gameState = state;
}



async function main() {
  await loadConfig();

  const config = getConfig();
  // console.log("Configuration loaded:", config);

  

  

  const playerSpawnPoint = config.playerSpawnPoint;

  let scene, renderer, material, light, orbit, cameraController, camera; // Initial variables
  scene = new THREE.Scene(); // Create main scene
  renderer = initRenderer(); // Init a basic renderer
  material = setDefaultMaterial(); // create a basic material
  light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
  cameraController = new CameraControls(renderer);
  camera = cameraController.camera;


  // // Show axes (parameter is size of each axis)
  // var axesHelper = new THREE.AxesHelper(12);
  // scene.add(axesHelper);

  // create the ground plane
  let plane = createGroundPlaneXZ(1000, 1000);
  scene.add(plane);

  

  

  loadPlayers();

  render();

  function createPlayer() {
    let new_player = new Player();

    new_player.spawnPoint = playerSpawnPoint[Player.playerNumber - 1];

    gameState.players.push(new_player);
  }

  function loadPlayers() {
    gameState.players.forEach((entity) => {
      console.log("loading player " + entity.name);
      entity.load(scene);
    });
  }

  

  

  

  

  function render() {
    keyboardUpdate();
    cameraUpdate();
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera); // Render scene
  }
}

main().catch((error) => {
  console.error("Error initializing:", error);
});

// }