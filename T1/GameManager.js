import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
    initRenderer,
    initDefaultBasicLight,
    setDefaultMaterial,
    createGroundPlane,
    createLightSphere,
    radiansToDegrees,
    InfoBox,
    SecondaryBox,
    onWindowResize,
    createGroundPlaneXZ,
    getMaxSize,
} from "../libs/util/util.js";

import { CameraControls } from "./camera.js";
import { Player } from "./entities/player.js";
import { ProjectileCollisionSystem, TankCollisionSystem } from "./collision.js";
import { Entity } from "./entities/entity.js";
import { getConfig } from "./config.js";
import { CollisionBlock } from "./blocks.js";
import { AISystem, Bot, Turret, TurretSystem } from "./bot.js";
import { preloadCommonTankModel } from "./entities/tanks/models/common_tank_model.js";
import { TeapotGeometry } from "../build/jsm/geometries/TeapotGeometry.js";
import { loadGLBFile } from "./models.js";
import { getTexture, loadTexture } from "./textures.js";
import {createTurret} from './entities/turret/model/turret_model.js'

export class GameManager {
    constructor(level, lighting, renderer = null) {
        this.levelData = level;
        this.renderer = renderer;
        this.config = getConfig();
        this.lighting = lighting;
        this.turretsPos = [
            {
                "x": 19,
                "y": 11
            }
        ]

        
    }

    async start() {
        this.setup();
        this.defineLevelColors();
        await this.loadModels();
        await this.loadTextures();
        this.loadLevel(this.levelData);
        this.createPlayers();
        this.createTurrets(this.levelData);
        this.createCollisionSystem();
        this.createAISystem();
        this.createTurretSystem();
    }

    async loadModels() {
        await preloadCommonTankModel().catch((error) =>
            console.error("Error preloading tank model:", error)
        );
    }

    async loadTextures() {
        loadTexture("./assets/textures/basic_wall.jpg", "basic_wall");
        loadTexture("./assets/textures/basic_floor.jpg", "basic_floor");
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

    manageLevelChange() {
        if (this.keyboard.down("0")) {
            this.changeLevelFunction(0);
        }
        else if (this.keyboard.down("1")) {
            this.changeLevelFunction(1);
        }
        else if (this.keyboard.down("2")) {
            this.changeLevelFunction(2);
        }
    }

    setup() {
        this.numberOfPlayers = Math.max(
            2,
            Math.min(this.config.numberOfPlayers, 4)
        ); //min = 2, max = 4
        this.scene = new THREE.Scene(); // Create main scene
        if (this.renderer === null) this.renderer = initRenderer(); // Init a basic renderer
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.material = setDefaultMaterial(); // create a basic material
        // this.light = initDefaultBasicLight(this.scene);
        const AmbientLight = new THREE.AmbientLight(0xffffff, 0.8); // soft white light
        this.scene.add(AmbientLight);
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

        this.bots = [];
        this.turrets = [];

        this.projectileCollisionSystem = null;
        this.tankCollisionSystem = null;
        this.walls = [];

        this.startGame = false;

        this.listening();
    }

    createPlayer(index) {
        let new_player = new Player("", [0, 0], "", "", this.config);

        new_player.spawnPoint = this.playerSpawnPoint[Player.playerNumber - 1];

        if (index == 2) {
            new_player._controller.isBot = true;
            let bot1 = new Bot(new_player);
            this.bots.push(bot1);
        }
        if (index == 3) {
            new_player._controller.isBot = true;
            let bot2 = new Bot(new_player);
            this.bots.push(bot2);
        }

        this.players[index] = new_player;
    }

    defineLevelColors() {
        this.wallColor = 0x404040;
        this.groundColor = 0xb2beb5;
        this.spawnColor = 0xff0000;
    }

    createLightSphere(scene, radius, widthSegments, heightSegments, position) {
        var geometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments,
            0,
            Math.PI * 2,
            0,
            Math.PI
        );
        var material = new THREE.MeshBasicMaterial({
            color: "rgb(255,255,50)",
        });
        var object = new THREE.Mesh(geometry, material);
        object.visible = true;
        object.position.copy(position);
        scene.add(object);

        return object;
    }

    // createTeapot(x, y, z, color) {
    //     let geometry = new TeapotGeometry(17);
    //     let material = new THREE.MeshPhongMaterial({
    //         color,
    //         shininess: "100",
    //         specular: "white",
    //     });
    //     material.side = THREE.DoubleSide;
    //     let obj = new THREE.Mesh(geometry, material);
    //     obj.castShadow = true;
    //     obj.position.set(x, y, z);
    //     this.scene.add(obj);
    // }

    degrees_to_radians(degrees) {
        // Store the value of pi.
        let pi = Math.PI;
        // Multiply degrees by pi divided by 180 to convert to radians.
        return degrees * (pi / 180);
    }

    normalizeDegrees(degress) {
        if (degress > 180) {
            return degress - 180;
        }
        return degress;
    }

    drawLights(x, y, z, objective_angle = 0) {
        let asset = {
            object: null,
            loaded: false,
            bb: new THREE.Box3(),
        };
        loadGLBFile(asset, "./assets/models/LampPost.glb", 46, this.scene, {
            x,
            y: y - 42,
            z,
        });

        let lightPosition = new THREE.Vector3(x, y, z);

        // Sphere to represent the light
        let lightSphere = this.createLightSphere(
            this.scene,
            1,
            10,
            10,
            lightPosition
        );
        //this.createTeapot( 320,  18.5,  180, 0xffffff);

        //---------------------------------------------------------
        // Create and set the spotlight
        let spotLight = new THREE.SpotLight(`rgb(240,240,136)`);
        spotLight.position.copy(lightPosition);
        const directionalZ =
            60 * Math.cos(this.degrees_to_radians(objective_angle)) * -1;
        const directionalX =
            60 * Math.sin(this.degrees_to_radians(objective_angle));
        spotLight.target.position.set(x + directionalX, -50, z + directionalZ);
        spotLight.distance = 100;
        spotLight.castShadow = true;
        spotLight.decay = 0.4;
        spotLight.penumbra = 0.8;
        spotLight.intensity = 30;
        spotLight.angle = THREE.MathUtils.degToRad(33);
        // Shadow Parameters
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.fov = radiansToDegrees(spotLight.angle);
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 200;
        // Enable shadows for the spotlight
        spotLight.castShadow = true;

        // Adjust shadow properties for quality
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.fov = 30; // Field of view for the shadow camera
        this.scene.add(spotLight);
        spotLight.target.updateMatrixWorld();
        // Create helper for the spotlight
        // const spotHelper = new THREE.SpotLightHelper(spotLight, 0xFF8C00);
        // this.scene.add(spotHelper);
        // const shadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
        // this.scene.add(shadowHelper);
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

        const createBlock = (
            i,
            j,
            yTranslation,
            materialParameters,
            hasCollision = false
        ) => {
            const geometry = new THREE.BoxGeometry(
                BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
            let material = new THREE.MeshLambertMaterial(materialParameters);
            const cube = new THREE.Mesh(geometry, material);
            cube.receiveShadow = true;

            const translation = getTranslation(i, j, yTranslation);
            //console.log(translation)
            cube.translateX(translation.x);
            cube.translateY(translation.y);
            cube.translateZ(translation.z);
            cube.castShadow = true;

            if (hasCollision) {
                let wall = new CollisionBlock();
                wall.setBlockSize(BLOCK_SIZE);
                wall.setModel(cube);
                wall.createCollisionShape();
                this.walls.push(wall);
                // let helper = new THREE.Box3Helper(
                //     wall.collisionShape,
                //     0x000000
                // );
                // this.scene.add(helper);
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
                            -BLOCK_SIZE / 2 + levelHeight,
                            {
                                color: data[i][j].color,
                                map: getTexture("basic_floor"),
                            },
                            false
                        );
                        break;
                    case "WallBlock":
                        createBlock(
                            i,
                            j,
                            BLOCK_SIZE / 2 + levelHeight,
                            {
                                color: data[i][j].color,
                                map: getTexture("basic_wall"),
                            },
                            true
                        );
                        break;
                    case "Spawn":
                        createBlock(i, j, -BLOCK_SIZE / 2 + levelHeight, {
                            color: this.spawnColor,
                            map: getTexture("basic_wall"),
                        });
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
            for (let i = spawnIndex; i < this.numberOfPlayers; i++) {
                if (this.playerSpawnPoint[i - spawnIndex])
                    this.playerSpawnPoint.push(
                        this.playerSpawnPoint[i - spawnIndex]
                    );
                else this.playerSpawnPoint.push([2, 2]);
            }
        }

        

        for (let i = 0; i < this.lighting.length; i++) {
            for (let j = 0; j < this.lighting[i].length; j++) {
                if ("angle" in this.lighting[i][j]) {
                    let translated = getTranslation(
                        i,
                        j,
                        BLOCK_SIZE / 2 + levelHeight
                    );

                    let lightPosition = new THREE.Vector3(
                        translated.x,
                        translated.y + 50,
                        translated.z
                    );

                    // Sphere to represent the light
                    let lightSphere = this.createLightSphere(
                        this.scene,
                        1,
                        10,
                        10,
                        lightPosition
                    );
                    this.drawLights(
                        translated.x,
                        translated.y + 50,
                        translated.z,
                        this.lighting[i][j]["angle"]
                    );
                }
            }
        }
        
        
        //
    }

    createTurrets(level) {
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
        for(let i = 0; i < this.turretsPos.length; i++) {
            let data = this.turretsPos[i]
            let translation = getTranslation(data.x,
                data.y,
                -BLOCK_SIZE / 2 + levelHeight + 8.6)
            let turret = createTurret(translation.x, translation.y, translation.z)
            this.scene.add(turret.base)
            this.scene.add(turret.body)
            this.turrets.push(new Turret(turret.body, this.players[1], this.bots))
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

    createAISystem() {
        this.ai_system = new AISystem(this.players[1], this.walls, this.bots);
    }

    createTurretSystem() {
        this.turrets_system = new TurretSystem(this.turrets);
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
        this.manageLevelChange();

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

    updateAiAction() {
        for (let index = 0; index < this.bots.length; index++) {
            this.ai_system.nextAction(index);
            this.bots[index].move();            
        }
    }

    updateTurretsActions() {
        this.turrets_system.nextAction();
    }

    insertNewProjectiles() {
        for (const key in this.players) {
            const player = this.players[key];
            let playerProjectiles = player.tank.projectiles;
            for (
                let index = playerProjectiles.length - 1;
                index >= 0;
                index--
            ) {
                this.projectiles.push(playerProjectiles[index]);
            }

            // console.log(player.tank.projectiles);
            player.tank.projectiles = [];
        }

        for (let index = 0; index < this.turrets.length; index++) {
            const turret = this.turrets[index];
            let turretProjectiles = turret._projectiles;
            console.log(turretProjectiles.length)
            for (let index2 = turretProjectiles.length - 1; index2 >= 0; index2--) {
                this.projectiles.push(turretProjectiles[index2]);
            }

            // console.log(player.tank.projectiles);
            this.turrets[index]._projectiles = [];
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
        if (Object.keys(this.players).length > 1) {
            this.startGame = true;
        }
        if (this.startGame) {
            if (Object.keys(this.players).length <= 1) {
                let winner = 0;
                for (const key in this.players) {
                    if (!this.deadIndex.includes(key)) {
                        winner = key;
                    }
                }
                this.shotInfo.hide();
                this.deleteScene(this.scene);
                winner = winner;
                alert("Game Over! Player " + winner + " won!");
                this.resetFunction();
                return true;
            }
        }
        return false;
    }
    deleteScene(scene) {
        scene.clear();
    }

    frame() {
        if (!(this.checkEnd() || !this.startGame)) {
            this.keyboardUpdate();
            this.updateAiAction();
            this.updateTurretsActions();
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

    setChangeLevelFunction(func) {
        this.changeLevelFunction = func;
    }

    render() {
        
        this.renderer.render(this.scene, this.camera);
    }
}
