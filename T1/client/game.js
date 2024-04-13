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

import { Player } from "./entities/player.js";

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

    // Bind methods
    this.createGame = this.createGame.bind(this);
    this.setState = this.setState.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.loadPlayers = this.loadPlayers.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
    this.showInformation = this.showInformation.bind(this);
    this.render = this.render.bind(this);
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
    const cam = this.camera;
    const rend = this.renderer;
    window.addEventListener(
      "resize",
      function () {
        onWindowResize(cam, rend);
      },
      false
    );
  }

  createPlayers(players) {
    let playersObject = {};
    for (const playerId in players) {
      const player = players[playerId];

      let name = player.name;
      let type = player.type;

      //tank
      let x = player.x;
      let z = player.z;
      let rotation = player.rotation;
      let movement = player.movement;
      // let health = player.health;w

      let modelName = player.modelName;
      let amogColor = player.amogColor;
      let tankColor = player.tankColor;

      let newPlayer = new Player(
        name,
        [x, z],
        rotation,
        modelName,
        amogColor,
        tankColor
      );

      playersObject[playerId] = newPlayer;
    }
    return playersObject;
  }

  setState(state) {
    if (state) {
      this.gameState.currentLevelMap = state.currentLevelMap;
      this.gameState.players = this.createPlayers(state.players);
    }
    this.loadPlayers();
  }

  removePlayer(command) {
    const id = command.playerId;
    this.gameState.players.id = null;
  }

  loadPlayers() {
    const players = this.gameState.players;
    for (const playerId in players) {
      let player = players[playerId];
      console.log("loading player " + player.name);
      player.load(this.gameState.scene);
    }
  }

  updatePlayers(players) {
    
    let uncreatedPlayers = {};
    for (const playerId in players) {
      const playerInfo = players[playerId];
      let player = this.gameState.players[playerId];
      if (!player) uncreatedPlayers[playerId] = player;
      else {
        player.tank.model.position.x = playerInfo.x;
        player.tank.model.position.z = playerInfo.z;
        console.log(playerInfo.rotation);
        player.tank.model.rotation.y = playerInfo.rotation;
        // player.tank.health = playerInfo.health;
      }
    }
    if (Object.keys(uncreatedPlayers).length > 0) {
      this.createPlayers(uncreatedPlayers);
    }
  }

  updateGamestate(state) {
    if (state.players) this.updatePlayers(state.players);
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
