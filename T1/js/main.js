import { initRenderer } from "../../libs/util/util.js";

import { GameManager } from "./gameManager.js";

import { loadConfig } from "./config.js";
import {
    loadLevels,
    getNextLevel,
    loadLights,
    getLights,
    getLevel,
} from "./levels.js";

async function main() {
    const renderer = initRenderer();

    let level = getNextLevel();
    let lightning = getLights();

    let manager = new GameManager(level, lightning, renderer);
    await manager.start();

    const resetFunction = () => {
        console.log("Reseting Level");
        console.log("Restarting game");
        
        level = getNextLevel();
        lightning = getLights();
        manager = new GameManager(level, lightning, renderer);
        manager.start();
        
        manager.setResetFunction(resetFunction);
        manager.setChangeLevelFunction(changeLevelFunction);
    };
    
    const changeLevelFunction = (index) => {
        console.log("Changing Level");
        console.log("Restarting game");

        level = getLevel(index);
        lightning = getLights(index);
        manager = new GameManager(level, lightning, renderer);
        manager.start();

        manager.setResetFunction(resetFunction);
        manager.setChangeLevelFunction(changeLevelFunction);
    };

    function render() {
        manager.frame();
        requestAnimationFrame(render);
        manager.render();
    }

    manager.setResetFunction(resetFunction);
    manager.setChangeLevelFunction(changeLevelFunction);
    render();
}

async function initialize() {
    await loadConfig();
    await loadLevels();
    await loadLights();
}

await initialize();
main();
