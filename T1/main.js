import {
  initRenderer
} from "../libs/util/util.js";

import { GameManager } from "./gameManager.js";

import { loadConfig } from "./config.js";
import { loadLevels, getNextLevel } from "./levels.js";




async function main() { 
  const renderer = initRenderer();

  let level = getNextLevel();

  let manager = new GameManager(level,renderer);
  manager.start()

  
  const resetFunction = () => {
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
