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
import { ProjectileCollisionSystem } from "./CollisionSystem/collisionSystem.js"

import { getConfig, loadConfig } from "./config.js";
import {JsonDecoder} from "./level_builder_interpreter/JsonDecoder.js"
import { GameManager } from "./GameManager.js";


function frame() {

}

async function main() {
  const manager = new GameManager()
  await manager.initialize();
  manager.load()
  manager.drawGround(manager.levelDecoded.blocks, manager.levelDecoded.offset)
  manager.loadPlayers()
  //manager.drawWalls(manager.levelDecoded.blocks, manager.levelDecoded.offset)
  
  function render() {
    manager.frame()
    requestAnimationFrame(render)
    manager.render()
  }

  render()
}

main()
// function render(manager) {
//   manager.frame();
//   requestAnimationFrame(render)
//   manager.render();
// }

// window.addEventListener('DOMContentLoaded', () => {
//   render(gameManager); // Agora o this dentro de frame() se refere a gameManager
// });


