import * as THREE from "three";

import { Player } from "./entities/player.js";

import { getConfig, loadConfig } from "./config.js";
import * as CollisionSystem from "./collision.js";
import { CollisionBlock } from "./blocks.js";

export default class Game {
    constructor() {
        this._gamestate = {
            currentLevelMap: null,
            players: {},
            projectiles: [],
            walls: [],
            // entities: {},
        };

        this.config = null;
        this.playerSpawnPoint = null;

        loadConfig();
        this.config = getConfig();
        this.playerSpawnPoint = this.config.playerSpawnPoint;

        this.observers = [];
        this.lastMovementTime = {}; // Map to store the timestamp of the last movement command for each player
        this.bufferedMovement = [];
    }

    run() {
        this.updateMovements();
        this.updateProjectiles();
        this.updatePlayersStatus();
        this.updateDevices();
    }

    set levelMap(level) {
        this._gamestate.currentLevelMap = level;
        this.playerSpawnPoint = level.spawn;

        const getWalls = (level) => {
            console.log(level);
            const walls = [];
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

            const createBlock = (i, j, yTranslation) => {
                const geometry = new THREE.BoxGeometry(
                    BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                const cube = new THREE.Mesh(geometry);
                const translation = getTranslation(i, j, yTranslation);
                cube.translateX(translation.x);
                cube.translateY(translation.y);
                cube.translateZ(translation.z);

                let wall = new CollisionBlock();
                wall.setBlockSize(BLOCK_SIZE);
                wall.setModel(cube);
                wall.createCollisionShape();
                walls.push(wall);
            };

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].length; j++) {
                    switch (data[i][j].type) {
                        case "WallBlock":
                            createBlock(i, j, BLOCK_SIZE / 2 + levelHeight);
                            break;
                    }
                }
            }
            return walls;
        };
        this._gamestate.walls = getWalls(level);
    }

    setState(state) {
        this._gamestate = state;
    }

    createPlayers(players) {
        for (const playerId in players) {
            const spawnIndex = (Player.playerNumber) % 3;
            const spawnPoint = [this.playerSpawnPoint[spawnIndex][0] * 17,this.playerSpawnPoint[spawnIndex][1] * 17]
            const newPlayer = new Player(playerId,spawnPoint);
            // console.log(newPlayer._tank._model.position);
            this._gamestate.players[playerId] = newPlayer;
        }
    }

    removeDevice(command) {
        let updateCommand = {};
        let removePlayersCommand = {};
        const id = command.playerId;
        for (let i = 1; i < 5; i++) {
            removePlayersCommand[id + "." + i] =
                this._gamestate.players[id + "." + i];
            delete this._gamestate.players[id + "." + i];
        }
        updateCommand.type = "remove-player";
        updateCommand.players = removePlayersCommand;
        this.notifyAll(updateCommand);
        console.log(`> Removing players from device: ${id}`);
    }

    removePlayer(id) {
        let updateCommand = {};
        let removePlayersCommand = {};
        removePlayersCommand[id] = this._gamestate.players[id];
        delete this._gamestate.players[id];

        updateCommand.type = "remove-player";
        updateCommand.players = removePlayersCommand;
        this.notifyAll(updateCommand);
        console.log(`> Removing dead player: ${id}`);
    }

    insertMovement(commands) {
        commands.forEach((command) => {
            const id = commands.playerId + "." + command.localPlayerId;

            this.bufferedMovement.push({ id, movement: command });
        });
    }

    movePlayer(command) {
        const id = command.id;
        const player = this._gamestate.players[id];

        if (player) {
            player.runController(command.movement);
        }
    }

    get encodedPlayers() {
        const players = this._gamestate.players;
        let encodedPlayers = {};
        for (const playerId in this._gamestate.players) {
            const player = players[playerId];
            if (player) {
                let encodedPlayer = {};

                encodedPlayer.id = playerId;
                encodedPlayer.name = player.name;
                encodedPlayer.type = "player";

                encodedPlayer.health = player.tank.health;

                encodedPlayer.x = player.tank.model.position.x;
                encodedPlayer.z = player.tank.model.position.z;
                encodedPlayer.rotation = player.tank.rotation;
                encodedPlayer.movement = player.tank.lastMovement;
                // encodedPlayer.health = player.tank.health;

                encodedPlayer.modelName = player.tank.modelName;
                encodedPlayer.amogColor = player.tank.amogColor;
                encodedPlayer.tankColor = player.tank.tankColor;

                // encodedPlayer.shots = null

                encodedPlayers[playerId] = encodedPlayer;
            }
        }
        return encodedPlayers;
    }

    get encodedProjectiles() {
        let encodedProjectiles = {};

        this._gamestate.projectiles.forEach((projectile) => {
            let encodedProjectile = {};

            encodedProjectile.position = projectile.model.position;
            encodedProjectile.direction = projectile.direction;
            encodedProjectile.speed = projectile.speed;

            encodedProjectiles[projectile.id] = encodedProjectile;
        });
        return encodedProjectiles;
    }

    get encodedGamestate() {
        let encodedGamestate = {
            currentLevelMap: this._gamestate.currentLevelMap,
            players: this.encodedPlayers,
        };
        return encodedGamestate;
    }

    set gameState(gameState) {
        this._gamestate = gameState;
    }

    subscribe(observerFunction) {
        this.observers.push(observerFunction);
    }

    notifyAll(commands) {
        for (const observerFunction of this.observers) {
            observerFunction(commands);
        }
    }

    get update() {
        let update = {
            type: "regular-update",
            players: this.encodedPlayers,
            projectiles: this.encodedProjectiles,
        };
        return update;
    }

    updateDevices() {
        setInterval(() => {
            this.notifyAll(this.update);
        }, 10);
    }

    updateMovements() {
        let isProcessing = false;

        const processMovements = () => {
            if (!isProcessing && this.bufferedMovement.length > 0) {
                isProcessing = true;
                const commandsToProcess = this.bufferedMovement.splice(
                    0,
                    this.bufferedMovement.length
                );
                commandsToProcess.forEach((command) => {
                    this.movePlayer(command);
                });
                isProcessing = false;
            }
        };

        setInterval(processMovements, 10);
    }

    insertNewProjectiles() {
        for (const key in this._gamestate.players) {
            const player = this._gamestate.players[key];
            let playerProjectiles = player.tank.projectiles;
            for (
                let index = playerProjectiles.length - 1;
                index >= 0;
                index--
            ) {
                this._gamestate.projectiles.push(playerProjectiles[index]);
            }

            // console.log(player.tank.projectiles);
            player.tank.projectiles = [];
        }
    }

    updateProjectiles() {
        const checkCollision = () => {
            CollisionSystem.checkProjectilePlayerCollison(
                this._gamestate.projectiles,
                this._gamestate.players
            );

            CollisionSystem.checkProjectileWallCollison(
                this._gamestate.projectiles,
                this._gamestate.walls
            );
            CollisionSystem.checkPlayerWallCollision(
                this._gamestate.players,
                this._gamestate.walls
            );
        };
        const processProjectiles = () => {
            this.insertNewProjectiles();

            checkCollision();

            let indicesToRemove = [];

            // console.log(this._gamestate.projectiles);

            // Iterate over projectiles in reverse order
            for (
                let index = this._gamestate.projectiles.length - 1;
                index >= 0;
                index--
            ) {
                const projectile = this._gamestate.projectiles[index];
                if (!projectile.isAlreadyInScene()) {
                    projectile.setAlreadyInScene(true);
                }
                if (projectile.hitAnyTank || projectile.ricochetsLeft < 0) {
                    indicesToRemove.push(index);
                } else {
                    projectile.moveStep();
                }
            }

            // Remove elements using indicesToRemove
            indicesToRemove.forEach((index) => {
                this._gamestate.projectiles.splice(index, 1);
            });
        };

        setInterval(processProjectiles, 10);
    }

    updatePlayersStatus() {
        const checkDeath = () => {
            const players = this._gamestate.players;
            for (const key in players) {
                const player = players[key];
                if (player.tank.died) {
                    this.removePlayer(key);
                }
            }
        };

        setInterval(checkDeath, 10);
    }
}
