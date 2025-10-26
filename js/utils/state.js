/**
 * State Management Utilities
 * Handles localStorage persistence for session state
 */

const STATE_KEY = 'beatgrid_session_state';

/**
 * Saves the current session state to localStorage
 * @param {object} selected - Selected patterns {drum, bass, lead}
 * @param {number} tempo - Current tempo value
 */
export function saveState(selected, tempo) {
  const state = {
    tempo: parseInt(tempo),
    selectedIds: {
      drum: selected.drum?.id || null,
      bass: selected.bass?.id || null,
      lead: selected.lead?.id || null
    },
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
}

/**
 * Loads the session state from localStorage
 * @returns {object|null} Saved state or null if not found
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (!saved) return null;

    const state = JSON.parse(saved);
    return state;
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return null;
  }
}

/**
 * Clears the saved state
 */
export function clearState() {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch (err) {
    console.warn('Failed to clear state:', err);
  }
}
