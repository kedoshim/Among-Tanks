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
import { loadLevel } from "./levelLoader.js";
import { Projectile } from "./projectile.js";

export default class Game {
    constructor() {
        this.gameState = {
            scene: null,
            players: {},
            entities: [],
            projectiles: {},
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
        this.removePlayers = this.removePlayers.bind(this);
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
        for (const playerId in players) {
            if (this.gameState.players[playerId]) continue;
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

            this.gameState.players[playerId] = newPlayer;
            newPlayer.load(this.gameState.scene);
        }
    }

    setState(state) {
        if (state) {
            this.gameState.currentLevelMap = state.currentLevelMap;
            this.createPlayers(state.players);
            loadLevel(this.gameState.currentLevelMap, this.gameState.scene);
        }
    }

    removePlayers(players) {
        for (const playerId in players) {
            let player = this.gameState.players[playerId];
            this.gameState.scene.remove(player.tank.model);
            this.gameState.players[playerId] = null;
        }
    }

    updatePlayers(players) {
        let uncreatedPlayers = {};
        const playersToRemove = {};

        for (const playerId in players) {
            const playerInfo = players[playerId];
            let player = this.gameState.players[playerId];
            if (!player) uncreatedPlayers[playerId] = playerInfo;
            else {
                player.tank.model.position.x = playerInfo.x;
                player.tank.model.position.z = playerInfo.z;
                if (playerInfo.rotation) {
                    player.tank.model.rotation.x = playerInfo.rotation._x;
                    player.tank.model.rotation.y = playerInfo.rotation._y;
                    player.tank.model.rotation.z = playerInfo.rotation._z;
                }
                // player.tank.health = playerInfo.health;
            }
        }
        if (Object.keys(uncreatedPlayers).length > 0) {
            this.createPlayers(uncreatedPlayers);
            uncreatedPlayers = {};
        }
        for (const playerId in this.gameState.players) {
            // Check if the player exists in the updated players list
            if (!players[playerId]) {
                // If the player doesn't exist in the updated players list, add it to playersToRemove
                playersToRemove[playerId] = this.gameState.players[playerId];
            }
        }
    }

    updateProjectiles(projectilesState) {
        for (const key in projectilesState) {
            const projectile = projectilesState[key];
            const position = new THREE.Vector3(
                projectile.position.x,
                projectile.position.y,
                projectile.position.z
            );
            const direction = new THREE.Vector3(
                projectile.direction.x,
                projectile.direction.y,
                projectile.direction.z
            );
            if (this.gameState.projectiles[key]) {
                this.gameState.projectiles[key].model.position.copy(position);
                this.gameState.projectiles[key].direction = direction;                
            }
            else {
                let newProjectile = new Projectile(position, direction , projectile.speed);
                this.gameState.scene.add(newProjectile.model);
                this.gameState.projectiles[key] = newProjectile;
            }
        }
    }

    updateGamestate(state) {
        if (state.type == "regular-update") {
            if (state.players) this.updatePlayers(state.players);
            if (state.projectiles) this.updateProjectiles(state.projectiles);
        }
        if (state.type == "remove-player") {
            console.log(state);
            if (state.players) this.removePlayers(state.players);
        }
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
