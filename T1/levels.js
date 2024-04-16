import { JsonDecoder } from "./level_builder_interpreter/JsonDecoder.js";

const levelPaths = {
  1: "./levels/level1.json",
  1: "./levels/level2.json",
  2: "./levels/level2.json",
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
  try {
    if (levels[index + 1]) {
      index += 1;
    } return levels[index];
  } catch {
    index = 1;
    return levels[index];
  }
}
