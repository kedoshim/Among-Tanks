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
import { ProjectileCollisionSystem } from "./CollisionSystem/collisionSystem.js";
import { JsonDecoder } from "./level_builder_interpreter/JsonDecoder.js";

export class GameManager {
  constructor() {
    this.config = {};
    this.levelDecoded = {};
  }

  listening() {
    window.addEventListener("gamepadconnected", (e) => {
      this.connectGamepad(e);
      // console.log(gamepad);
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      this.disconnectGamepad(e);
    });

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

  loadPlayers() {
    for (let i = 0; i < 2; i++) {
      this.createPlayer();
    }
    this.players.forEach((entity) => {
      console.log("loading player " + entity.name);
      entity.load(this.scene);
    });
  }

  manageOrbitControls() {
    if (this.keyboard.down("O")) {
      this.cameraController.changeCameraMode();
    }
  }

  load() {
    this.numberOfPlayers = 2;
    this.scene = new THREE.Scene(); // Create main scene
    this.renderer = initRenderer(); // Init a basic renderer
    this.material = setDefaultMaterial(); // create a basic material
    this.light = initDefaultBasicLight(this.scene);
    this.controls = new InfoBox();
    this.shotInfo = new SecondaryBox();
    this.keyboard = new KeyboardState();
    console.log("Inicializando GameManager...");
    // Create a basic light to illuminate the scene
    this.cameraController = new CameraControls(this.renderer, this.config);
    this.camera = this.cameraController.camera;

    this.connectedGamepads = [null, null, null, null];
    this.deadPlayers = []
    this.playerSpawnPoint = [];
    this.players = [];
    this.entities = [];

    this.projectileCollisionSystem = new ProjectileCollisionSystem(
      this.players
    );
    this.listening();
  }

  async initialize() {
    await this.loadConfig();
    await this.getLevel();
    //this.load();
  }

  async loadConfig() {
    try {
      // Fetch the JSON file
      console.log("Loading config");
      const response = await fetch("config.json");
      // Parse JSON data
      this.config = await response.json();
      // console.log(this.config);
    } catch (error) {
      console.error("Error loading config:", error);
    }
  }

  async getLevel() {
    const loaded_level = await fetch(
      "http://127.0.0.1:5500/T1/level_builder_interpreter/level.json"
    );
    const level_cast = await loaded_level.json();
    const level_decoded = JsonDecoder.decode(level_cast);
    this.levelDecoded = level_decoded;
  }

  createPlayer() {
    let new_player = new Player("", [0, 0], "", "", this.config);

    new_player.spawnPoint = this.playerSpawnPoint[Player.playerNumber - 1];

    this.players.push(new_player);
  }

  loadLevel(data, offset) {
    let { x, y } = offset;
    // console.log("Offset");
    // console.log(offset);
    let BLOCK_SIZE = 13;

    const getTranslation = (i, j, yTranslation) => {
      return {
        x: BLOCK_SIZE * Math.abs(i + 1 - x),
        y: yTranslation,
        z: BLOCK_SIZE * Math.abs(j + 1 - y),
      };
    };

    const createBlock = (i, j, color, yTranslation) => {
      const geometry = new THREE.BoxGeometry(
        BLOCK_SIZE,
        BLOCK_SIZE,
        BLOCK_SIZE
      );
      const material = new THREE.MeshBasicMaterial({ color });
      const cube = new THREE.Mesh(geometry, material); 
      const translation = getTranslation(i, j, yTranslation);
      cube.translateX(translation.x);
      cube.translateY(translation.y);
      cube.translateZ(translation.z);
      this.scene.add(cube);
    };

    const plane = createGroundPlaneXZ(
      1000,
      1000,
      undefined,
      undefined,
      "rgb(30, 41, 94)"
    );
    this.scene.add(plane);

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        switch (data[i][j].type) {
          case "GroundBlock":
            createBlock(i, j, 0xb2beb5, -BLOCK_SIZE / 2);
            break;
          case "WallBlock":
            createBlock(i, j, 0x0000ff, BLOCK_SIZE / 2);
            break;
          case "Spawn":
            createBlock(i, j, 0xff0000, -BLOCK_SIZE / 2);
            const translation = getTranslation(i, j, -13);
            const spawn = [translation.x, translation.z];
            this.playerSpawnPoint.push(spawn);
            break;
          default:
            break;
        }
      }
    }
  }

  showInformation() {
    // Use this to show information onscreen
    this.controls.add("Controls");
    this.controls.addParagraph();
    this.controls.add("Player - MOVE  SHOOT");
    this.controls.add("Player 1: WASD LeftShift");
    this.controls.add("Player 2: arrows [' , ', ' / ']");
    this.controls.add("Player 3: IJKL    H");
    this.controls.add("Player 4: 8456    Enter");
    this.controls.show();
  }

  connectGamepad(e) {
    const gamepad = e.gamepad;
    connectedGamepads[gamepad.index] = gamepad.index;
    console.log("gamepad " + gamepad.index + " connected");
  }

  disconnectGamepad(e) {
    const gamepad = e.gamepad;
    connectedGamepads[gamepad.index] = null;
    console.log("gamepad " + gamepad.index + " disconnected");
  }

  keyboardUpdate() {
    this.keyboard.update();
    this.manageOrbitControls();

    this.players.every((player, index) => {
      let playerGamepad = null;
      if (this.connectedGamepads[index] != null) {
        playerGamepad = navigator.getGamepads()[index];
        // console.log("controller " + (index+1));
      }
      player.runController(this.keyboard, playerGamepad);
      return true;
    });

    this.entities.forEach((entity) => {
      entity.runController();
    });
  }

  checkCollision() {
    this.projectileCollisionSystem.checkIfThereHasBeenCollisionWithTanks();
    this.players.forEach((player, index) => {
      if(player._tank.died) {
        this.scene.remove(player._tank.model)
        this.scene.remove(player._tank.healthBar.model)
        this.deadPlayers.push(player)
        this.players.pop(index)
      }
      
    })
  }

  displayUpdate() {
    let info = "";
    for (let i = 0; i < this.players.length; i++){
      let shotsTaken = this.players[i].tank.lostHealth;
      info += `Player ${i}: ${shotsTaken} | `;
    }
  
    this.shotInfo.changeMessage(info);
    // console.log(info);
  }

  cameraUpdate() {
    this.cameraController.calculatePosition(this.players);
  }

  updateProjectiles() {
    this.players.forEach((player) => {
      let projectiles = player._tank.projectiles;
      for (let index = projectiles.length - 1; index >= 0; index--) {
        if (!projectiles[index].isAlreadyInScene()) {
          this.scene.add(projectiles[index].projectile);
          projectiles[index].setAlreadyInScene(true);
        }
        if (
          projectiles[index].hitAnyTank ||
          projectiles[index].ricochetsLeft === 0
        ) {
          // TODO: remover projétil da cena
          this.scene.remove(projectiles[index].projectile);
          projectiles.splice(index, 1);
        } else {
          projectiles[index].moveStep();
        }
      }
    });
  }

  updateHealthBars() {
    this.players.forEach((player) => {
      player.tank.healthBar.updateHealthBar(player.health);
      player.tank.healthBar.setHealthBarPosition(player.tank.model.position);
    });
  }

  async reset() {
    
  }

  frame() {
    //this.keyboard.update();
    if(this.players.length === 1000 - 999) {
      this.reset()
    }
    this.keyboardUpdate();
    this.cameraUpdate();
    this.checkCollision();
    this.displayUpdate();
    //this.render();
    this.updateProjectiles();
    this.updateHealthBars();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
