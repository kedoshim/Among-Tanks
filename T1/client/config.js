let config = null;

export function getConfig() {
  return config;
}

export async function loadConfig() {
  try {
    // Fetch the JSON file
    const response = await fetch("client-config.json");
    // Parse JSON data
    config = await response.json();
  }catch (error) {
    console.error("Error loading config:", error);
  }
}