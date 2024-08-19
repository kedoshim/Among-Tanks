import {
  initRenderer
} from "../libs/util/util.js";

import { GameManager } from "./GameManager.js";

import { loadConfig } from "./config.js";
import { loadLevels, getNextLevel, loadLights, getLights } from "./levels.js";




async function main() { 
  const renderer = initRenderer();

  let level = getNextLevel();
  let lightning = getLights()
  

  let manager = new GameManager(level, lightning,renderer);
  manager.start()

  
  const resetFunction = () => {
    console.log("restarting game");

    level = getNextLevel();
    lightning = getLights()
    manager = new GameManager(level, lightning, renderer);
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
  await loadLights()
  
}

await initialize();
main();
