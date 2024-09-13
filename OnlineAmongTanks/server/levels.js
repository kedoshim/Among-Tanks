import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const levelsDirectory = path.join(__dirname, "levels");

const levelPaths = {
    1: path.join(levelsDirectory, "level1.json"),
    2: path.join(levelsDirectory, "level2.json"),
};

const levels = {};
const lightning = {};
const turrets = {};

let index = 0;

export function getLevels() {
    return levels;
}

export async function loadLevels() {
    try {
        for (const key in levelPaths) {
            const filePath = levelPaths[key];
            const level_json = await fs.readFile(filePath, "utf-8");
            const level_data = decode(JSON.parse(level_json).blocks);
            levels[key] = level_data;
        }
    } catch (error) {
        console.error("Error loading levels:", error);
    }
}

export function getNextLevel() {
    index = (index % Object.keys(levelPaths).length) + 1;
    return levels[index];
}

function decode(json) {
    const firstNotEmpty = findFirstNotEmpty(json);
    const spawns = getSpawnPoints(json, firstNotEmpty);

    return {
        offset: firstNotEmpty,
        blocks: json,
        spawn: spawns,
    };
}

function findFirstNotEmpty(blocksArray) {
    for (let i = 0; i < blocksArray.length; i++) {
        for (let j = 0; j < blocksArray[i].length; j++) {
            if (blocksArray[i][j].type !== "EmptyBlock") {
                return { x: i, y: j };
            }
        }
    }
}

function getSpawnPoints(blocksArray, offset) {
    const spawnPoints = [];
    for (let i = 0; i < blocksArray.length; i++) {
        for (let j = 0; j < blocksArray[i].length; j++) {
            if (blocksArray[i][j].type === "Spawn") {
                spawnPoints.push([i, j]);
            }
        }
    }

    return spawnPoints;
}
