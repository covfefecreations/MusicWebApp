// data.js - modular data loader
// Loads pattern data from JSON files in the /data directory

/**
 * Fetches JSON data from a file
 * @param {string} path - Path to the JSON file
 * @returns {Promise<any>} Parsed JSON data
 */
async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.statusText}`);
  }
  return response.json();
}

// Load all data files
export const drums = await loadJSON('../data/drums.json');
export const basses = await loadJSON('../data/basses.json');
export const leads = await loadJSON('../data/leads.json');
