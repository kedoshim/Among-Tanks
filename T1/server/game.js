import * as THREE from "three";

import { Player } from "./entities/player.js";

import { getConfig, loadConfig } from "./config.js";

export default class Game {
  constructor() {
    this._gamestate = {
      currentLevelMap: null,
      players: {},
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

  start() {
    this.updateDevices();
    this.updateMovements();
  }

  set levelMap(level) {
    this._gamestate.currentLevelMap = level;
  }

  setState(state) {
    this._gamestate = state;
  }

  createPlayers(players) {
    for (const playerId in players) {
      const newPlayer = new Player(playerId);
      newPlayer.spawnPoint = this.playerSpawnPoint[newPlayer.playerNumber - 1];
      this._gamestate.players[playerId] = newPlayer;
    }
  }

  removeDevice(command) {
    let removePlayersCommand = {};
    const id = command.playerId;
    for (let i = 1; i < 5; i++) {
      removePlayersCommand[id + "." + i] =
        this._gamestate.players[id + "." + i];
      this._gamestate.players[id + "." + i] = null;
    }
    removePlayersCommand.type = "remove-players";
    this.notifyAll(removePlayersCommand);
    console.log(`> Removing players from device: ${id}`);
  }

  loadPlayers() {
    const { scene, players } = this._gamestate;
    players.forEach((player) => {
      console.log("> Loading player " + player.name);
      player.load(scene);
    });
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

  get players() {
    const players = this._gamestate.players;
    let encodedPlayers = {};
    for (const playerId in this._gamestate.players) {
      const player = players[playerId];
      if (player) {
        let encodedPlayer = {};

        encodedPlayer.id = playerId;
        encodedPlayer.name = player.name;
        encodedPlayer.type = "player";

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

  get gameState() {
    let encodedGamestate = {
      currentLevelMap: this._gamestate.currentLevelMap,
      players: this.players,
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
      players: this.players,
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
}
