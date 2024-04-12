import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
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
import { ProjectileCollisionSystem } from "./CollisionSystem/collisionSystem.js"

import { getConfig, loadConfig } from "./config.js";

window.addEventListener("gamepadconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = gamepad.index;
  console.log("gamepad " + gamepad.index + " connected");
  // console.log(gamepad);
});

window.addEventListener("gamepaddisconnected", (e) => {
  const gamepad = e.gamepad;
  connectedGamepads[gamepad.index] = null;
  console.log("gamepad " + gamepad.index + " disconnected");
});

async function main() {
  await loadConfig();

  const config = getConfig();
  // console.log("Configuration loaded:", config);

  const NumberOfPlayers = config.numberOfPlayers;

  let entities = [];
  let players = [];
  let connectedGamepads = [null, null, null, null];

  const playerSpawnPoint = config.playerSpawnPoint;

  let scene, renderer, material, light, orbit, cameraController, camera; // Initial variables
  scene = new THREE.Scene(); // Create main scene
  renderer = initRenderer(); // Init a basic renderer
  material = setDefaultMaterial(); // create a basic material
  light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
  cameraController = new CameraControls(renderer);
  camera = cameraController.camera;

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
  let plane = createGroundPlaneXZ(1000, 1000);
  scene.add(plane);

  for (let i = 0; i < NumberOfPlayers; i++) {
    createPlayer();
  }

  var positionMessage = new SecondaryBox("");
  positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu");

  let projectileCollisionSystem = new ProjectileCollisionSystem(players);

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

  function manageOrbitControls() {
    if (keyboard.down("O")) {
      cameraController.changeCameraMode();
    }
  }

  function keyboardUpdate() {
    keyboard.update();
    manageOrbitControls();

    players.every((player, index) => {
      let playerGamepad = null;
      if (connectedGamepads[index] != null) {
        playerGamepad = navigator.getGamepads()[index];
        // console.log("controller " + (index+1));
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
    controls.add("Player 2: arrows [' , ', ' / ']");
    controls.add("Player 3: IJKL    H");
    controls.add("Player 4: 8456    Enter");
    controls.show();
  }

  function cameraUpdate() {
    cameraController.calculatePosition(players);
  }

  function updateProjectiles() {
    players.forEach(player => {
      let projectiles = player._tank.projectiles;
      for (let index = projectiles.length - 1; index >= 0; index--) {
        if (!projectiles[index].isAlreadyInScene()) {
          scene.add(projectiles[index].projectile);
          projectiles[index].setAlreadyInScene(true);
        }
        if (projectiles[index].hitAnyTank || projectiles[index].ricochetsLeft === 0) {
          // TODO: remover projétil da cena
          scene.remove(projectiles[index].projectile);
          projectiles.splice(index, 1);
        }
        else {
          projectiles[index].moveStep();
        }
      }
      //player._tank.projectiles = projectiles;
    })
  }

  function checkCollision() {
    projectileCollisionSystem.checkIfThereHasBeenCollisionWithTanks();
  }

  function updateHealthBars() {
    players.forEach(player => {
      player.healthBar.updateHealthBar(player.lifes);
      player.healthBar.setHealthBarPosition(player._tank.model.position);
    })
  }

  function render() {
    keyboardUpdate();
    cameraUpdate();
    checkCollision();
    updateProjectiles();
    updateHealthBars();
    requestAnimationFrame(render); // Show events
    renderer.render(scene, camera); // Render scene
  }
}

main().catch((error) => {
  console.error("Error initializing:", error);
});
