import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

let config = null;

export function getConfig() {
  return config;
}

export function loadConfig() {
  try {
    // Get the path to the current module
    const modulePath = fileURLToPath(import.meta.url);

    // Resolve the absolute path to the configuration file
    const configPath = path.resolve(
      path.dirname(modulePath),
      "./server-config.json"
    );

    // Read the JSON file synchronously
    const configFileData = fs.readFileSync(configPath, "utf8");

    // Parse JSON data
    config = JSON.parse(configFileData);

    // console.log("Config loaded successfully:", config);
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}
