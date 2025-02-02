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
import { ProjectileCollisionSystem, TankCollisionSystem } from "./collision.js";
import { Entity } from "./entities/entity.js";
import { getConfig } from "./config.js";
import { CollisionBlock } from "./blocks.js";

export class GameManager {
    constructor(level, renderer = null) {
        this.levelData = level;
        this.renderer = renderer;
        this.config = getConfig();
    }

    start() {
        this.setup();
        this.defineLevelColors();
        this.loadLevel(this.levelData);
        this.createPlayers();
        this.createCollisionSystem();
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

    createPlayers() {
        Player.playerNumber = 0;
        Entity.entityNumber = 0;

        for (let i = 1; i <= this.numberOfPlayers; i++) {
            this.createPlayer(i);
        }
        for (const key in this.players) {
            const player = this.players[key];
            console.log("loading player '" + player.name + "'");
            player.load(this.scene);
        }
    }

    manageOrbitControls() {
        if (this.keyboard.down("O")) {
            this.cameraController.changeCameraMode();
        }
    }

    setup() {
        this.numberOfPlayers = Math.max(
            2,
            Math.min(this.config.numberOfPlayers, 4)
        ); //min = 2, max = 4
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
        this.deadPlayers = {};
        this.deadIndex = [];
        this.playerSpawnPoint = [];
        this.players = {};
        this.projectiles = [];
        this.entities = [];
        this.previousHitBox = [];

        this.projectileCollisionSystem = null;
        this.tankCollisionSystem = null;
        this.walls = [];

        this.listening();
    }

    createPlayer(index) {
        let new_player = new Player("", [0, 0], "", "", this.config);

        new_player.spawnPoint = this.playerSpawnPoint[Player.playerNumber - 1];

        this.players[index] = new_player;
    }

    defineLevelColors() {
        this.wallColor = 0x404040;
        this.groundColor = 0xb2beb5;
        this.spawnColor = 0xff0000;
    }

    loadLevel(level) {
        const levelHeight = 5;
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
                let helper = new THREE.Box3Helper(
                    wall.collisionShape,
                    0x000000
                );
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

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                switch (data[i][j].type) {
                    case "GroundBlock":
                        createBlock(
                            i,
                            j,
                            this.groundColor,
                            -BLOCK_SIZE / 2 + levelHeight
                        );
                        break;
                    case "WallBlock":
                        createBlock(
                            i,
                            j,
                            this.wallColor,
                            BLOCK_SIZE / 2 + levelHeight
                        );
                        break;
                    case "Spawn":
                        createBlock(
                            i,
                            j,
                            this.spawnColor,
                            -BLOCK_SIZE / 2 + levelHeight
                        );
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
                    this.playerSpawnPoint.push(
                        this.playerSpawnPoint[i - spawnIndex]
                    );
                else this.playerSpawnPoint.push([2, 2]);
            }
        }
    }

    createCollisionSystem() {
        this.tankCollisionSystem = new TankCollisionSystem(
            this.players,
            this.walls
        );
        this.projectileCollisionSystem = new ProjectileCollisionSystem(
            this.players,
            this.walls,
            this.projectiles
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

        for (const key in this.players) {
            const player = this.players[key];
            let playerGamepad = null;
            if (this.connectedGamepads[key] != null) {
                playerGamepad = navigator.getGamepads()[key];
            }
            player.runController(this.keyboard, playerGamepad);
        }

        this.entities.forEach((entity) => {
            entity.runController();
        });
    }

    checkCollision() {
        this.projectileCollisionSystem.checkIfThereHasBeenCollisionWithTanks();

        for (const key in this.players) {
            const player = this.players[key];
            if (player._tank.died) {
                this.removeDeadPlayer(player, key);
            }
        }

        this.projectileCollisionSystem.checkCollisionWithWalls();
        this.tankCollisionSystem.checkCollisionWithWalls();
    }

    removeDeadPlayer(player, key) {
        this.scene.remove(player.tank.model);
        this.scene.remove(player.tank.healthBar.model);

        player.tank.projectiles.forEach((projectile) => {
            this.scene.remove(projectile.projectile);
        });

        this.deadPlayers[key] = player;
        this.deadIndex.push(key);
        delete this.players[key];
        console.log(`Player ${player.name} died`);
    }

    displayUpdate() {
        let info = "Vida Perdida: ";
        for (const key in this.players) {
            const player = this.players[key];
            let shotsTaken = player.tank.lostHealth;
            info += `Player ${key}: ${shotsTaken} | `;
        }

        info = info.substring(0, info.length - 2);

        this.shotInfo.changeMessage(info);
        this.shotInfo.changeStyle("#00b3ad", 0xffffff, "25", "Lucida Console");
    }

    cameraUpdate() {
        this.cameraController.calculatePosition(this.players);
    }

    insertNewProjectiles() {
        for (const key in this.players) {
            const player = this.players[key];
            let playerProjectiles = player.tank.projectiles;
            for (let index = playerProjectiles.length - 1; index >= 0; index--) {
                this.projectiles.push(playerProjectiles[index]);
            }
            

            // console.log(player.tank.projectiles);
            player.tank.projectiles = [];
        }
    }

    updateProjectiles() {
    this.insertNewProjectiles();

    let indicesToRemove = [];

    // Iterate over projectiles in reverse order
    for (let index = this.projectiles.length - 1; index >= 0; index--) {
        const projectile = this.projectiles[index];
        if (!projectile.isAlreadyInScene()) {
            this.scene.add(projectile.projectile);
            projectile.setAlreadyInScene(true);
        }
        if (projectile.hitAnyTank || projectile.ricochetsLeft < 0) {
            this.scene.remove(projectile.projectile);
            indicesToRemove.push(index);
        } else {
            projectile.moveStep();
        }
    }

    // Remove elements using indicesToRemove
    indicesToRemove.forEach((index) => {
        this.projectiles.splice(index, 1);
    });

        // console.log(this.projectiles);
    }

    updateHealthBars() {
        for (const key in this.players) {
            const player = this.players[key];
            player.tank.healthBar.updateHealthBar(player.health);
            player.tank.healthBar.setHealthBarPosition(player.tank.position);
        }
    }

    checkEnd() {
        if (Object.keys(this.players).length <= 1) {
            let winner = 0;
            for (const key in this.players) {
                if (!this.deadIndex.includes(key)) {
                    winner = key;
                }
            }
            this.shotInfo.hide();
            this.deleteScene(this.scene);
            this.resetFunction();
            winner = winner;
            alert("Game Over! Player " + winner + " won!");
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
            this.updateHealthBars();
            this.updateProjectiles();
            // this.updateHitBoxDisplay();
        }
    }

    updateHitBoxDisplay() {
        this.previousHitBox.forEach((box) => {
            this.scene.remove(box);
        });
        for (const key in this.players) {
            const player = this.players[key];
            this.previousHitBox[index] = player.loadHitBox(this.scene);
        }
    }

    setResetFunction(func) {
        this.resetFunction = func;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
