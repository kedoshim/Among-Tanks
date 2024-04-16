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
import { ProjectileCollisionSystem } from "./CollisionSystem/collisionSystem.js";


import { GameManager } from "./GameManager.js";

import { loadConfig } from "./config.js";
import { loadLevels, getNextLevel } from "./levels.js";




async function main() {
  let level = getNextLevel();

  let manager = new GameManager(level);
  manager.start()

  
  const resetFunction = (renderer) => {
    console.log("restarting game");

    level = getNextLevel();
    
    manager = new GameManager(level, renderer);
    manager.start();
    
    manager.setResetFunction(resetFunction);
  };
  
  function render() {
    manager.frame();
    requestAnimationFrame(render);
    manager.render();
  }
  
  manager.setResetFunction(resetFunction);
  render();
}

async function initialize() {
  await loadConfig();
  await loadLevels();
}

await initialize();
main();
