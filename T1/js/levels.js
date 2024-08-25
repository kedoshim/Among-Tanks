const levelPaths = {
  0: "./level_builder/py/level.json",
  1: "./levels/level1.json",
  2: "./levels/level2.json",
};

const levels = {};
const lightning = {}
const turrets = {}

let index = 0;

export function getLevels() {
  return levels;
}

export async function loadLevels() {
  for (const index in levelPaths) {
    const path = levelPaths[index];
    const loaded_level = await fetch(path);
    const level_json = await loaded_level.json();
    const level_data = decode(level_json.blocks);
    levels[index] = level_data;
  }
}

export async function loadLights() {
  console.log("Loading lights")
  for (const index in levelPaths) {
    const path = levelPaths[index];
    const loaded_level = await fetch(path);
    const level_json = await loaded_level.json();
    const level_data = level_json.lightning
    lightning[index] = level_data;
  }
}

export async function loadTurrets() {
  console.log("Loading lights")
  for (const index in levelPaths) {
    const path = levelPaths[index];
    const loaded_level = await fetch(path);
    const level_json = await loaded_level.json();
    const level_data = level_json.turrets
    turrets[index] = level_data;
  }
}

export function getNextLevel() {
  if (index + 1 in levelPaths) {
    index += 1;
    // console.log(levels, index);
    return levels[index]; 
  } else {
    index = 1;
    console.log(levels, index);
    return levels[index];
  }
}

export function getCurrentLevel() {
  return levels[index];
}

export function getLevel(index) {
  if (levels[index])
    return levels[index];
  return levels[0];
}

export function getLights(ind = null) {
  if (ind)
    return lightning[ind];
  else
    return lightning[index]
}

export function getTurrets(ind = null) {
  if (ind)
    return turrets[ind];
  else
    return turrets[index]
}


function decode(json) {
    let firstNotEmpty = findFirstNotEmpty(json);
    let spawns = getSpawnPoints(json, firstNotEmpty);

    let newJson = {
        offset: firstNotEmpty,
        blocks: json,
        spawn: spawns,
    };

    return newJson;
}

function findFirstNotEmpty(blocksArray) {
    let block = {};
    for (let i = 0; i < blocksArray.length; i++) {
        for (let j = 0; j < blocksArray[i].length; j++) {
            if (blocksArray[i][j].type !== "EmptyBlock")
                return { x: i, y: j };
        }
    }
}

function getSpawnPoints(blocksArray, offset) {
    let spawnPoints = [];
    for (let i = 0; i < blocksArray.length; i++) {
        for (let j = 0; j < blocksArray[i].length; j++) {
            if (blocksArray[i][j].type === "Spawn")
                spawnPoints.push([i, j]);
        }
    }

    return spawnPoints;
}