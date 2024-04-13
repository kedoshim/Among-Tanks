import * as THREE from "three";

import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
} from "../../libs/util/util.js";

import { Player } from "./entities/player.js";

import { getConfig, loadConfig } from "./config.js";

export default class Game {
  constructor() {
    this._gamestate = {
      currentLevelMap : null,
      players: {},
      // entities: {},
    };

    
    this.config = null;
    this.playerSpawnPoint = null;

    loadConfig();
    this.config = getConfig();
    this.playerSpawnPoint = this.config.playerSpawnPoint;
  }

  setState(state) {
    this._gamestate = state;
  }

  createPlayer(command) {
    let id = command.playerId;
    const newPlayer = new Player(id);
    newPlayer.spawnPoint = this.playerSpawnPoint[newPlayer.playerNumber - 1];
    this._gamestate.players[id] = newPlayer;
  }

  removePlayer(command) {
    const id = command.playerId;
    this._gamestate.players.id = null;
  }

  loadPlayers() {
    const { scene, players } = this._gamestate;
    players.forEach((player) => {
      console.log("loading player " + player.name);
      player.load(scene);
    });
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

        encodedPlayer.tank = {};
        encodedPlayer.tank.x = player.tank.model.position.x;
        encodedPlayer.tank.z = player.tank.model.position.z;
        encodedPlayer.tank.rotation = player.tank.lastRotationAngle;
        encodedPlayer.tank.movement = player.tank.lastMovement;
        // encodedPlayer.tank.health = player.tank.health;

        encodedPlayer.tank.modelName = player.tank.modelName;
        encodedPlayer.tank.amogColor = player.tank.amogColor;
        encodedPlayer.tank.tankColor = player.tank.tankColor;

        // encodedPlayer.shots = null

        encodedPlayers[playerId] = encodedPlayer;
      }
    }
    return encodedPlayers;
  }

  get gameState() {
    let encodedGamestate = {
      currentLevelMap: this._gamestate.currentLevelMap,
      players : this.players
    }
    return encodedGamestate;
  }

  set gameState(gameState) {
    this._gamestate = gameState;
  }
}
