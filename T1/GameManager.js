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
import { ProjectileCollisionSystem, TankCollisionSystem } from "./CollisionSystem/collisionSystem.js";
import { JsonDecoder } from "./level_builder_interpreter/JsonDecoder.js";
import { Entity } from "./entities/entity.js";
import { getConfig } from "./config.js";
import { CollisionBlock } from "./Blocks/blocks.js";

export class GameManager {
  constructor(level, renderer = null) {
    this.levelData = level;
    this.renderer = renderer;
    this.config = getConfig();
  }

  start() {
    this.load();
    this.defineLevelColors();
    this.loadLevel(this.levelData);
    this.loadPlayers();
    this.loadCollisionSystems();

    console.log(this.walls.length);
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
    Player.playerNumber = 0;
    Entity.entityNumber = 0;

    for (let i = 0; i < this.numberOfPlayers; i++) {
      this.createPlayer();
    }
    console.log(this.players);
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
    this.numberOfPlayers = Math.min(this.config.numberOfPlayers, 4);
    this.scene = new THREE.Scene(); // Create main scene
    if (this.renderer === null) this.renderer = initRenderer(); // Init a basic renderer
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
    this.deadPlayers = [];
    this.playerSpawnPoint = [];
    this.players = [];
    this.entities = [];
    this.previousHitBox = [];

    this.projectileCollisionSystem = null;
    this.tankCollisionSystem = null;
    this.walls = [];

    this.listening();
  }

  createPlayer() {
    let new_player = new Player("", [0, 0], "", "", this.config);

    new_player.spawnPoint = this.playerSpawnPoint[Player.playerNumber - 1];

    this.players.push(new_player);
  }

  defineLevelColors() {
    this.wallColor = 0x404040;
    this.groundColor = 0xb2beb5;
    this.spawnColor = 0xff0000;
  }

  loadLevel(level) {
    const data = level.blocks;
    let { x, y } = level.offset;

    const BLOCK_SIZE = 17;

    const getTranslation = (i, j, yTranslation) => {
      return {
        x: BLOCK_SIZE * i + 1 - x,
        y: yTranslation,
        z: BLOCK_SIZE * j + 1 - y,
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

      if (color === this.wallColor) {
        let wall = new CollisionBlock();
        wall.setBlockSize(BLOCK_SIZE);
        wall.setModel(cube);
        wall.createCollisionShape();
        this.walls.push(wall);
      }

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

    let spawnIndex = 0;

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        switch (data[i][j].type) {
          case "GroundBlock":
            createBlock(i, j, this.groundColor, -BLOCK_SIZE / 2);
            break;
          case "WallBlock":
            createBlock(i, j, this.wallColor, BLOCK_SIZE / 2);
            break;
          case "Spawn":
            createBlock(i, j, this.spawnColor, -BLOCK_SIZE / 2);
            const translation = getTranslation(i, j, -13);
            const spawn = [translation.x, translation.z];
            this.playerSpawnPoint[spawnIndex] = spawn;
            spawnIndex++;
            break;
          default:
            break;
        }
      }
    }
    if (spawnIndex < this.numberOfPlayers) {
      console.log(spawnIndex)
      for (let i = spawnIndex; i < this.numberOfPlayers; i++){
        if (this.playerSpawnPoint[i - spawnIndex])
          this.playerSpawnPoint.push(this.playerSpawnPoint[i-spawnIndex]);
        else
        this.playerSpawnPoint.push([2,2]);
      }
    }
  }

  loadCollisionSystems() {
    this.tankCollisionSystem = new TankCollisionSystem(this.players, this.walls);
    this.projectileCollisionSystem = new ProjectileCollisionSystem(this.players, this.walls);
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
      if (player._tank.died) {
        this.scene.remove(player._tank.model);
        this.scene.remove(player._tank.healthBar.model);
        this.deadPlayers.push(player);
        this.players.pop(index);
      }
    });

    this.projectileCollisionSystem.checkCollisionWithWalls();
    this.tankCollisionSystem.checkCollisionWithWalls();
  }

  displayUpdate() {
    let info = "";
    for (let i = 0; i < this.players.length; i++) {
      let shotsTaken = this.players[i].tank.lostHealth;
      info += `Player ${i}: ${shotsTaken} | `;
    }

    this.shotInfo.changeMessage(info);
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
          projectiles[index].ricochetsLeft < 0
        ) {
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
      player.tank.healthBar.setHealthBarPosition(player.tank.position);
    });
  }

  reset() {
    let allPlayers = [];
    this.players.forEach((player) => {
      allPlayers.push(player);
      this.scene.remove(player._tank.model);
      this.scene.remove(player._tank.healthBar.model);
    });
    this.deadPlayers.forEach((player) => allPlayers.push(player));

    this.players = [];
    this.players = allPlayers;

    this.players.forEach((player) => {
      player.reset(this.scene);
      player.load(this.scene);
    });

    this.projectileCollisionSystem = new ProjectileCollisionSystem(
      this.players
    );

    this.deadPlayers = [];
    this.playerSpawnPoint = [];
    this.entities = [];
  }

  checkEnd() {
    if (this.players.length <= 1) {
      this.deleteScene(this.scene);
      this.resetFunction(this.renderer);
      alert("Game Over");
      return true;
    }
    return false;
  }
  deleteScene(scene) {
    scene.clear();
  }

  frame() {
    if (!this.checkEnd()) {
      this.keyboardUpdate();
      this.cameraUpdate();
      this.checkCollision();
      this.displayUpdate();
      //this.render();
      this.updateProjectiles();
      this.updateHealthBars();
      this.updateHitBox();
    }
  }

  updateHitBox() {
    this.previousHitBox.forEach((box) => {
      this.scene.remove(box);
    });
    this.players.forEach((player, index) => {
      this.previousHitBox[index] = player.loadHitBox(this.scene);
    });
  }

  setResetFunction(func) {
    this.resetFunction = func;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
