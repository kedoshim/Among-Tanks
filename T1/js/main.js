import { initRenderer } from "../../libs/util/util.js";

import { GameManager } from "./gameManager.js";

import { loadConfig } from "./config.js";
import {
    loadLevels,
    getNextLevel,
    loadLights,
    getLights,
    getLevel,
    getTurrets,
    loadTurrets,
    getCurrentLevel
} from "./levels.js";

async function main() {
    const renderer = initRenderer();

    let level = getNextLevel();
    let lightning = getLights();
    let turret = getTurrets()

    let manager = new GameManager(level, lightning, turret, renderer);
    await manager.start();

    const resetFunction = (bool) => {
        console.log("Reseting Level");
        console.log("Restarting game");
        
        if(!bool) {
            level = getCurrentLevel();
        }
        else {
            level = getNextLevel();
        }
        lightning = getLights();
        turret = getTurrets()
        manager = new GameManager(level, lightning, turret, renderer);
        manager.start();
        
        manager.setResetFunction(resetFunction);
        manager.setChangeLevelFunction(changeLevelFunction);
    };
    
    const changeLevelFunction = (index) => {
        console.log("Changing Level");
        console.log("Restarting game");

        level = getLevel(index);
        lightning = getLights(index);
        turret = getTurrets(index)
        manager = new GameManager(level, lightning, turret, renderer);
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
    await loadTurrets();
}

await initialize();
main();
