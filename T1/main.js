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
import {JsonDecoder} from "./level_builder_interpreter/JsonDecoder.js"
import { Block, CollisionBlock } from "./Blocks/blocks.js";

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
  const loaded_level = await fetch("http://127.0.0.1:5500/T1/level_builder_interpreter/level.json")
  const level_cast = await loaded_level.json()
  const level_decoded = JsonDecoder.decode(level_cast)
  console.log(level_decoded)
  await loadConfig();

  const config = getConfig();
  // console.log("Configuration loaded:", config);

  const BLOCK_SIZE = 13; // Size of all blocks in scene
  let walls = []; // wall Blocks list for collision system

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

  function drawLevel(data, offset) {
    for(let i = 0; i < data.length; i++) {
      for(let j = 0; j < data[i].length; j++) {
        if(data[i][j].type === "GroundBlock") {
          const position = {x: i, y: -13, z: j}
          const color = {color: 0xB2BEB5};

          const groundBlock = new Block(position, BLOCK_SIZE);
          groundBlock.createBlock(offset, color);
          scene.add(groundBlock.model);
        }
        else if(data[i][j].type === "WallBlock") {
          const position = {x: i, y: 0, z:j};
          const color = {color : 0x0000ff}

          const wallBlock = new CollisionBlock(position, BLOCK_SIZE);
          wallBlock.createBlock(offset, color);
          wallBlock.createCollisionShape();
          scene.add(wallBlock.model);

          walls.push(wallBlock);
        }
      }
    }
  }

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
  //let plane = createGroundPlaneXZ(1000, 1000);
  //scene.add(plane);

  for (let i = 0; i < NumberOfPlayers; i++) {
    createPlayer();
  }

  var positionMessage = new SecondaryBox("");
  positionMessage.changeStyle("rgba(0,0,0,0)", "lightgray", "16px", "ubuntu");

  loadPlayers();

  drawLevel(level_decoded.blocks, level_decoded.offset);
  let projectileCollisionSystem = new ProjectileCollisionSystem(players, walls);

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
        if (projectiles[index].hitAnyTank || projectiles[index].ricochetsLeft < 0) {
          scene.remove(projectiles[index].projectile);
          projectiles.splice(index, 1);
        }
        else {
          projectiles[index].moveStep();
        }
      }
    })
  }

  function checkCollision() {
    projectileCollisionSystem.checkIfThereHasBeenCollisionWithTanks();
    projectileCollisionSystem.checkCollisionWithWalls();
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
