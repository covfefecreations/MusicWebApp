// app.js - Main application entry point
import { createCard, highlightCard } from './components/card.js';
import { createAudioEngine, createSequences, stopSequences } from './components/audioEngine.js';
import { saveState, loadState, clearState } from './utils/state.js';
import { formatTriplet, formatAllForLLM, downloadJSON } from './utils/formatters.js';

/**
 * Renders the BeatGrid application
 * @param {object} params - Application parameters {drums, basses, leads, icons}
 */
export function renderApp({ drums, basses, leads, icons }) {
  // DOM references
  const drumGrid = document.getElementById('drumGrid');
  const bassGrid = document.getElementById('bassGrid');
  const leadGrid = document.getElementById('leadGrid');
  const tempoRange = document.getElementById('tempo');
  const tempoLabel = document.getElementById('tempoLabel');
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');

  // Application state
  let selected = { drum: null, bass: null, lead: null };
  let isPlaying = false;
  let sequences = { drumSequence: null, bassSequence: null, leadSequence: null };

  // Create audio engine
  const synths = createAudioEngine();

  // ========== Playback Functions ==========

  /**
   * Starts audio playback
   */
  async function startPlayback() {
    if (!selected.drum && !selected.bass && !selected.lead) {
      toast('Please select at least one pattern to play');
      return;
    }

    await Tone.start(); // Required for browser audio context
    Tone.Transport.bpm.value = parseInt(tempoRange.value);

    // Stop any existing sequences
    stopSequences(sequences);

    // Create new sequences
    sequences = createSequences(selected, synths);

    Tone.Transport.start();
    isPlaying = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    playBtn.classList.add('opacity-50');
    stopBtn.classList.remove('opacity-50');
    toast('Playback started');
  }

  /**
   * Stops audio playback
   */
  function stopPlayback() {
    stopSequences(sequences);
    sequences = { drumSequence: null, bassSequence: null, leadSequence: null };

    Tone.Transport.stop();
    Tone.Transport.cancel();
    isPlaying = false;
    playBtn.disabled = false;
    stopBtn.disabled = true;
    playBtn.classList.remove('opacity-50');
    stopBtn.classList.add('opacity-50');
  }

  // ========== State Management ==========

  /**
   * Handles pattern selection
   */
  function handleSelection(item, type) {
    if (type === 'drum') selected.drum = item;
    if (type === 'bass') selected.bass = item;
    if (type === 'lead') selected.lead = item;

    // Save state after selection
    saveState(selected, tempoRange.value);
  }

  /**
   * Restores session state
   */
  function restoreState() {
    const state = loadState();
    if (!state) return;

    // Restore tempo
    if (state.tempo) {
      tempoRange.value = state.tempo;
      tempoLabel.textContent = state.tempo + ' BPM';
    }

    // Restore selected patterns
    if (state.selectedIds) {
      if (state.selectedIds.drum) {
        const drumPattern = drums.find(d => d.id === state.selectedIds.drum);
        if (drumPattern) {
          selected.drum = drumPattern;
          highlightCard(drumGrid, state.selectedIds.drum);
        }
      }

      if (state.selectedIds.bass) {
        const bassPattern = basses.find(b => b.id === state.selectedIds.bass);
        if (bassPattern) {
          selected.bass = bassPattern;
          highlightCard(bassGrid, state.selectedIds.bass);
        }
      }

      if (state.selectedIds.lead) {
        const leadPattern = leads.find(l => l.id === state.selectedIds.lead);
        if (leadPattern) {
          selected.lead = leadPattern;
          highlightCard(leadGrid, state.selectedIds.lead);
        }
      }

      toast('Session restored from previous visit');
    }
  }

  // ========== Event Listeners ==========

  playBtn.addEventListener('click', startPlayback);

  stopBtn.addEventListener('click', () => {
    stopPlayback();
    toast('Playback stopped');
  });

  tempoRange.addEventListener('input', () => {
    tempoLabel.textContent = tempoRange.value + ' BPM';
    if (isPlaying) {
      Tone.Transport.bpm.value = parseInt(tempoRange.value);
    }
    // Save state when tempo changes
    saveState(selected, tempoRange.value);
  });

  // Export all patterns
  document.getElementById('exportAll').addEventListener('click', () => {
    const out = { tempo: tempoRange.value, drums, basses, leads };
    downloadJSON(out, `beatgrid-${Date.now()}.json`);
  });

  // Copy selection for LLM
  document.getElementById('copySelection').addEventListener('click', () => {
    const formatted = formatTriplet(selected, tempoRange.value);
    navigator.clipboard.writeText(formatted);
    toast('Selected triplet copied for LLM');
  });

  // Download selection as JSON
  document.getElementById('downloadSelection').addEventListener('click', () => {
    const out = { tempo: tempoRange.value, selected };
    downloadJSON(out, `selection-${Date.now()}.json`);
  });

  // Format all for Claude/LLM
  document.getElementById('formatClaude').addEventListener('click', () => {
    const formatted = formatAllForLLM({ drums, basses, leads });
    navigator.clipboard.writeText(formatted);
    toast('Full dataset copied (LLM format)');
  });

  // Randomize selection
  document.getElementById('seedRandom').addEventListener('click', () => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    selected.drum = pick(drums);
    selected.bass = pick(basses);
    selected.lead = pick(leads);

    // Clear previous highlights
    document.querySelectorAll('.card.ring-2').forEach(card => {
      card.classList.remove('ring-2', 'ring-accent');
    });

    // Highlight random selections
    highlightCard(drumGrid, selected.drum.id);
    highlightCard(bassGrid, selected.bass.id);
    highlightCard(leadGrid, selected.lead.id);

    saveState(selected, tempoRange.value);
    toast('Random triplet selected');
  });

  // Save to GitHub Gist
  document.getElementById('saveGist').addEventListener('click', async () => {
    const token = prompt('Enter a GitHub personal access token with gist scope (or cancel to skip)');
    if (!token) return;

    const payload = {
      description: 'BeatGrid export',
      public: false,
      files: {
        'beatgrid.json': {
          content: JSON.stringify({ drums, basses, leads }, null, 2)
        }
      }
    };

    try {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: 'token ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (j.html_url) {
        toast('Gist saved: ' + j.html_url);
        window.open(j.html_url, '_blank');
      } else {
        toast('Gist save failed');
      }
    } catch (err) {
      toast('Error saving gist');
    }
  });

  // Clear session state
  document.getElementById('clearSession').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your saved session? This will reset all selections.')) {
      clearState();

      // Reset selections visually
      document.querySelectorAll('.card.ring-2').forEach(card => {
        card.classList.remove('ring-2', 'ring-accent');
      });

      // Reset selected state
      selected.drum = null;
      selected.bass = null;
      selected.lead = null;

      // Reset tempo to default
      tempoRange.value = 170;
      tempoLabel.textContent = '170 BPM';

      toast('Session cleared');
    }
  });

  // ========== Render Cards ==========

  drums.forEach(d => {
    const card = createCard(d, 'drum', icons, handleSelection, toast);
    drumGrid.appendChild(card);
  });

  basses.forEach(b => {
    const card = createCard(b, 'bass', icons, handleSelection, toast);
    bassGrid.appendChild(card);
  });

  leads.forEach(l => {
    const card = createCard(l, 'lead', icons, handleSelection, toast);
    leadGrid.appendChild(card);
  });

  // Restore previous session state after rendering cards
  restoreState();

  // ========== Utility Functions ==========

  /**
   * Shows a toast notification
   * @param {string} msg - Message to display
   */
  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.className = 'fixed right-6 bottom-6 bg-studio-800/80 text-white px-4 py-2 rounded-md shadow-lg z-50';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }
}
