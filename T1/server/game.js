import * as THREE from "three";

import {
  initDefaultBasicLight,
  createGroundPlaneXZ,
} from "../../libs/util/util.js";

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

    loadConfig();
    this.config = getConfig();
    this.playerSpawnPoint = this.config.playerSpawnPoint;

    this.gameState.scene = new THREE.Scene(); // Create main scene
    initDefaultBasicLight(this.gameState.scene); // Create a basic light to illuminate the scene

    const plane = createGroundPlaneXZ(1000, 1000);
    this.gameState.scene.add(plane);
  }

  setState(state) {
    this.gameState = state;
  }

  createPlayer(command) {
    const id = command.playerId;
    const newPlayer = new Player(id);
    newPlayer.spawnPoint = this.playerSpawnPoint[newPlayer.playerNumber - 1];
    this.gameState.players.id = newPlayer;
  }

  removePlayer(command) {
    const id = command.playerId;
    this.gameState.players.id = null;
  }

  loadPlayers() {
    const { scene, players } = this.gameState;
    players.forEach((player) => {
      console.log("loading player " + player.name);
      player.load(scene);
    });
  }
}
