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
import {
  ProjectileCollisionSystem,
  TankCollisionSystem,
} from "./CollisionSystem/collisionSystem.js";
import { JsonDecoder } from "./level_builder_interpreter/JsonDecoder.js";
import { Entity } from "./entities/entity.js";
import { getConfig } from "./config.js";
import { CollisionBlock } from "./Blocks/blocks.js";
import { Euler, Vector3 } from "../build/three.module.js";

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

    let dataCopy = [...data];

    const BLOCK_SIZE = 17;

    const getTranslation = (i, j, yTranslation) => {
      return {
        x: BLOCK_SIZE * i + 1 - x,
        y: yTranslation,
        z: BLOCK_SIZE * j + 1 - y,
      };
    };

    const createBlock = (
      i,
      j,
      color,
      yTranslation,
      size = 1,
      orientation = null,
      positionInMiddle = false
    ) => {
      let geometry;

      switch (orientation) {
        case null:
          break;
          case "row":
            if (positionInMiddle) i = i - 0.5;
            break;
        case "collumn":
          if (positionInMiddle) j = j - 0.5;
          break;
        }
        
      geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      const material = new THREE.MeshBasicMaterial({ color });
      const cube = new THREE.Mesh(geometry, material);
      const translation = getTranslation(i, j, yTranslation);
      cube.translateX(translation.x);
      cube.translateY(translation.y);
      cube.translateZ(translation.z);
      
      switch (orientation) {
        case "row":
          cube.scale.set(size, 1, 1);
          break;
          case "collumn":
          cube.scale.set(1, 1, size);
          break;
      }

      if (color === this.wallColor) {
        // Calculate bounding box manually
        const minPoint = new THREE.Vector3(
          cube.position.x - BLOCK_SIZE / 2,
          cube.position.y - BLOCK_SIZE / 2,
          cube.position.z - BLOCK_SIZE / 2
        );
        const maxPoint = new THREE.Vector3(
          cube.position.x + BLOCK_SIZE / 2,
          cube.position.y + BLOCK_SIZE / 2,
          cube.position.z + BLOCK_SIZE / 2
        );

        let wall = new CollisionBlock();
        wall.createCollisionShape(cube, minPoint, maxPoint);
        this.walls.push(wall);
        let helper = new THREE.Box3Helper(wall.collisionShape, "blue");
        this.scene.add(helper);
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

    const createMergedGroupRow = (groupSize, i, j) => {
      const initialCoordinate = j - groupSize + 1;

      const mediumCoordinate = groupSize / 2 + initialCoordinate - 0.5;

      for (let n = initialCoordinate; n <= j; n++) {
        if (n == mediumCoordinate) {
          dataCopy[n][i].type = "MergedBlock";
          dataCopy[n][i].size = groupSize;
          dataCopy[n][i].orientation = "row";
        } else if (n == mediumCoordinate + 0.5) {
          dataCopy[n][i].type = "MergedEvenBlock";
          dataCopy[n][i].size = groupSize;
          dataCopy[n][i].orientation = "row";
        } else {
          dataCopy[n][i].type = "EmptyBlock";
        }
      }

      // [e , w , w , w, e, w]
    };
    const createMergedGroupCollumn = (groupSize, i, j) => {
      const initialCoordinate = j - groupSize + 1;

      const mediumCoordinate = groupSize / 2 + initialCoordinate - 0.5;

      for (let n = initialCoordinate; n <= j; n++) {
        if (n == mediumCoordinate) {
          dataCopy[i][n].type = "MergedBlock";
          dataCopy[i][n].size = groupSize;
          dataCopy[i][n].orientation = "collumn";
        } else if (n == mediumCoordinate + 0.5) {
          dataCopy[i][n].type = "MergedEvenBlock";
          dataCopy[i][n].size = groupSize;
          dataCopy[i][n].orientation = "collumn";
        } else {
          dataCopy[i][n].type = "EmptyBlock";
        }
      }
    };

    // loop collumns
    for (let i = 0; i < data.length; i++) {
      let lastIterationWasWall = false;
      let groupSize = 0;
      for (let j = 0; j < data[i].length; j++) {
        if (lastIterationWasWall === false) {
          if (data[i][j].type == "WallBlock") {
            lastIterationWasWall = true;
            groupSize = 1;
          } else {
            lastIterationWasWall = false;
          }
        } else {
          if (data[i][j].type == "WallBlock") {
            groupSize += 1;
            if (j + 1 == data[i].length)
              createMergedGroupCollumn(groupSize, i, j);
          } else {
            if (groupSize > 1) createMergedGroupCollumn(groupSize, i, j - 1);
            lastIterationWasWall = false;
          }
        }
      }
    }

    // loop rows
    for (let i = 0; i < data[i].length; i++) {
      let lastIterationWasWall = false;
      let groupSize = 0;
      for (let j = 0; j < data.length; j++) {
        if (lastIterationWasWall === false) {
          if (data[j][i].type == "WallBlock") {
            lastIterationWasWall = true;
            groupSize = 1;
          } else {
            lastIterationWasWall = false;
          }
        } else {
          if (data[j][i].type == "WallBlock") {
            groupSize += 1;
            if (j + 1 == data.length) createMergedGroupRow(groupSize, i, j);
          } else {
            if (groupSize > 1) createMergedGroupRow(groupSize, i, j - 1);
            lastIterationWasWall = false;
          }
        }
      }
    }

    for (let i = 0; i < dataCopy.length; i++) {
      for (let j = 0; j < dataCopy[i].length; j++) {
        switch (dataCopy[i][j].type) {
          case "GroundBlock":
            createBlock(i, j, this.groundColor, -BLOCK_SIZE / 2);
            break;
          case "WallBlock":
            createBlock(i, j, this.wallColor, BLOCK_SIZE / 2);
            break;
          case "MergedBlock":
            createBlock(
              i,
              j,
              this.wallColor,
              BLOCK_SIZE / 2,
              dataCopy[i][j].size,
              dataCopy[i][j].orientation
            );
            break;
          case "MergedEvenBlock":
            createBlock(
              i,
              j,
              this.wallColor,
              BLOCK_SIZE / 2,
              dataCopy[i][j].size,
              dataCopy[i][j].orientation,
              true
            );
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
      console.log(spawnIndex);
      for (let i = spawnIndex; i < this.numberOfPlayers; i++) {
        if (this.playerSpawnPoint[i - spawnIndex])
          this.playerSpawnPoint.push(this.playerSpawnPoint[i - spawnIndex]);
        else this.playerSpawnPoint.push([2, 2]);
      }
    }
  }

  loadCollisionSystems() {
    this.tankCollisionSystem = new TankCollisionSystem(
      this.players,
      this.walls
    );
    this.projectileCollisionSystem = new ProjectileCollisionSystem(
      this.players,
      this.walls
    );
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

    this.players[0].tank.model.position.copy(
      new THREE.Vector3(105.11640851864755, 9.9, 31.999545926786677)
    );
    this.players[0].tank.rotation.copy(new Euler(-0, 1.0790926535898002, -0));

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
      info += `Player ${i + 1}: ${shotsTaken} | `;
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

  checkEnd() {
    if (this.players.length <= 1) {
      this.shotInfo.hide();
      this.deleteScene(this.scene);
      this.resetFunction();
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
