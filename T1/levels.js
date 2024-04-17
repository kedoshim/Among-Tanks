import { JsonDecoder } from "./level_builder_interpreter/JsonDecoder.js";

const levelPaths = {
  1: "./levels/level1.json",
  1: "./levels/level4.json",
  2: "./levels/level2.json",
  3: "./levels/level3.json",
};

const levels = {};

let index = 0;

export function getLevels() {
  return levels;
}

export async function loadLevels() {
  for (const index in levelPaths) {
    const path = levelPaths[index];
    const loaded_level = await fetch(path);
    const level_json = await loaded_level.json();
    const level_data = JsonDecoder.decode(level_json);
    levels[index] = level_data;
  }
}

export function getNextLevel() {
  if (index + 1 in levelPaths) {
    index += 1;
    console.log(levels, index);
    return levels[index]; 
  } else {
    index = 1;
    console.log(levels, index);
    return levels[index];
  }
}
