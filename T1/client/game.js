import * as THREE from "./public/three/build/three.module.js";
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  SecondaryBox,
  onWindowResize,
  createGroundPlaneXZ,
} from "./public/util/util.js";

import { CameraControls } from "./camera.js";

import { getConfig, loadConfig } from "./config.js";

export default class Game {
  constructor() {
    this.gameState = {
      scene: null,
      players: {},
      entities: [],
    };
    this.config = null;
    this.playerSpawnPoint = null;

    this.gameState.scene = new THREE.Scene(); // Create main scene
    initDefaultBasicLight(this.gameState.scene); // Create a basic light to illuminate the scene

    const plane = createGroundPlaneXZ(1000, 1000);
    this.gameState.scene.add(plane);
  }

  async createGame(state) {
    this.config = getConfig();

    this.setState(state);

    this.renderer = initRenderer(); // Init a basic renderer
    this.material = setDefaultMaterial(); // create a basic material
    this.cameraController = new CameraControls(this.renderer);
    this.camera = this.cameraController.camera;

    this.positionMessage = new SecondaryBox("");
    this.positionMessage.changeStyle(
      "rgba(0,0,0,0)",
      "lightgray",
      "16px",
      "ubuntu"
    );

    this.showInformation();

    // Listen window size changes
    window.addEventListener(
      "resize",
      function () {
        onWindowResize(camera, renderer);
      },
      false
    );
  }

  setState(state) {
    if(state)
      this.gameState = state;
    console.log(state)
  }

  removePlayer(command) {
    const id = command.playerId;
    this.gameState.players.id = null;
  }

  loadPlayers() {
    const { scene, players } = this.gameState;
    players.forEach((player) => {
      console.log("loading player " + player.name);
      player.load(scene);
    });
  }

  updateCamera() {
    if (Object.keys(this.gameState.players).length > 0)
      this.cameraController.calculatePosition(this.gameState.players);
  }

  showInformation() {
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

  render() {
    this.updateCamera();
    requestAnimationFrame(this.render); // Show events
    this.renderer.render(this.gameState.scene, this.camera); // Render scene
  }
}