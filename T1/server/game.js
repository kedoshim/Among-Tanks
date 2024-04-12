import * as THREE from "three";

import { initDefaultBasicLight,createGroundPlaneXZ } from "../../libs/util/util.js";




import { Player } from "./entities/player.js";

import { getConfig, loadConfig } from "./config.js";

export default class Game {
  constructor() {
    this.gameState = {
      scene: null,
      players: [],
      entities: [],
    };
    this.config = null;
    this.playerSpawnPoint = null;
  }

  setState(state) {
    this.gameState = state;
  }

  async createGame() {
    await loadConfig();
    this.config = getConfig();
    this.playerSpawnPoint = this.config.playerSpawnPoint;

    this.gameState.scene = new THREE.Scene(); // Create main scene
    initDefaultBasicLight(this.gameState.scene); // Create a basic light to illuminate the scene

    const plane = createGroundPlaneXZ(1000, 1000);
    this.gameState.scene.add(plane);
  }

  createPlayer() {
    const newPlayer = new Player();
    newPlayer.spawnPoint = this.playerSpawnPoint[newPlayer.playerNumber - 1];
    this.gameState.players.push(newPlayer);
  }

  loadPlayers() {
    const { scene, players } = this.gameState;
    players.forEach((player) => {
      console.log("loading player " + player.name);
      player.load(scene);
    });
  }
}
