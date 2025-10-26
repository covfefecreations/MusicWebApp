// app.js - Main application with step-by-step composition flow
import { createAudioEngine, createSequences, stopSequences } from './components/audioEngine.js';
import { saveState, loadState, clearState } from './utils/state.js';
import { formatTriplet, formatAllForLLM, downloadJSON } from './utils/formatters.js';

/**
 * Renders the BeatGrid application with card slot interface
 * @param {object} params - Application parameters {drums, basses, leads, icons}
 */
export function renderApp({ drums, basses, leads, icons }) {
  // ========== DOM References ==========

  // Views
  const startView = document.getElementById('startView');
  const selectionView = document.getElementById('selectionView');
  const compositionView = document.getElementById('compositionView');

  // Start screen
  const categoryButtons = document.querySelectorAll('[data-category]');

  // Selection screen
  const patternGrid = document.getElementById('patternGrid');
  const selectionTitle = document.getElementById('selectionTitle');
  const selectionSubtitle = document.getElementById('selectionSubtitle');
  const backBtn = document.getElementById('backBtn');
  const continueBtn = document.getElementById('continueBtn');
  const progressDots = document.querySelectorAll('.progress-dot');

  // Composition screen
  const drumSlot = document.getElementById('drumSlot');
  const bassSlot = document.getElementById('bassSlot');
  const leadSlot = document.getElementById('leadSlot');
  const slotAddButtons = document.querySelectorAll('.slot-add-btn');
  const slotChangeButtons = document.querySelectorAll('.slot-change-btn');

  // Playback controls
  const tempoRange = document.getElementById('tempo');
  const tempoLabel = document.getElementById('tempoLabel');
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Export controls
  const exportMenuBtn = document.getElementById('exportMenuBtn');
  const exportMenu = document.getElementById('exportMenu');

  // ========== Application State ==========

  let selected = { drum: null, bass: null, lead: null };
  let isPlaying = false;
  let sequences = { drumSequence: null, bassSequence: null, leadSequence: null };
  let currentView = 'start'; // 'start', 'selection', 'composition'
  let selectionFlow = []; // Track order: e.g. ['drum', 'bass', 'lead']
  let currentStepIndex = 0;
  let currentlySelectingType = null; // Which type we're currently picking
  let tempSelection = null; // Temporarily selected pattern before confirming

  // Create audio engine
  const synths = createAudioEngine();

  // ========== View Management ==========

  /**
   * Switches between views
   */
  function showView(viewName) {
    // Hide all views
    startView.classList.remove('active');
    selectionView.classList.remove('active');
    compositionView.classList.remove('active');

    // Show selected view
    if (viewName === 'start') {
      startView.classList.add('active');
      currentView = 'start';
    } else if (viewName === 'selection') {
      selectionView.classList.add('active');
      currentView = 'selection';
    } else if (viewName === 'composition') {
      compositionView.classList.add('active');
      currentView = 'composition';
    }
  }

  /**
   * Updates progress dots
   */
  function updateProgressDots() {
    progressDots.forEach((dot, index) => {
      dot.classList.remove('active', 'completed');
      if (index < currentStepIndex) {
        dot.classList.add('completed');
      } else if (index === currentStepIndex) {
        dot.classList.add('active');
      }
    });
  }

  // ========== Selection Flow ==========

  /**
   * Starts the selection flow for a category
   */
  function startSelectionFlow(startCategory) {
    // Determine the order based on what user picked first
    const categories = ['drum', 'bass', 'lead'];
    const index = categories.indexOf(startCategory);
    selectionFlow = [
      categories[index],
      categories[(index + 1) % 3],
      categories[(index + 2) % 3]
    ];

    currentStepIndex = 0;
    showSelectionStep();
  }

  /**
   * Shows the pattern selection for the current step
   */
  function showSelectionStep() {
    const type = selectionFlow[currentStepIndex];
    currentlySelectingType = type;

    // Update header
    const labels = {
      drum: 'Choose Your Drum Kit',
      bass: 'Choose Your Bass Pattern',
      lead: 'Choose Your Lead Melody'
    };
    selectionTitle.textContent = labels[type];
    selectionSubtitle.textContent = `Step ${currentStepIndex + 1} of 3`;

    // Update progress dots
    updateProgressDots();

    // Load patterns
    const patterns = type === 'drum' ? drums : (type === 'bass' ? basses : leads);
    renderPatternGrid(patterns, type);

    // Show selection view
    showView('selection');

    // Update buttons
    backBtn.disabled = currentStepIndex === 0;
    continueBtn.disabled = true; // Enable when pattern selected
  }

  /**
   * Renders pattern cards in the selection grid
   */
  function renderPatternGrid(patterns, type) {
    patternGrid.innerHTML = '';
    tempSelection = null;

    patterns.forEach(pattern => {
      const card = createPatternCard(pattern, type);
      patternGrid.appendChild(card);
    });
  }

  /**
   * Creates a pattern selection card
   */
  function createPatternCard(item, type) {
    const card = document.createElement('div');
    card.className = 'pattern-card p-4 rounded-xl';
    card.dataset.patternId = item.id;

    let detailsHTML = '';
    if (type === 'drum') {
      const pattern = item.pattern || '';
      const gridHTML = Array.from({ length: 32 }, (_, i) => {
        const isOn = pattern[i] === 'X';
        return `<div class="step ${isOn ? 'on' : ''}"></div>`;
      }).join('');
      detailsHTML = `<div class="grid grid-cols-8 gap-1 mt-3">${gridHTML}</div>`;
    } else if (type === 'bass') {
      detailsHTML = `<div class="mono mt-2 text-sm">${escapeHTML(item.prog || '')}</div>`;
    } else {
      detailsHTML = `<div class="mono mt-2 text-sm">${escapeHTML(item.motif || '')}</div>`;
    }

    card.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <div>
          <div class="font-semibold">${escapeHTML(item.title)}</div>
          <div class="text-xs muted mt-1">${item.bpm ? (item.bpm + ' BPM') : (escapeHTML(item.key) || '')}</div>
        </div>
        <div class="text-2xl">${getEmoji(type)}</div>
      </div>
      <div class="text-sm muted">${escapeHTML(item.mood || '')}</div>
      ${detailsHTML}
    `;

    // Click handler
    card.addEventListener('click', () => {
      // Remove previous selection
      document.querySelectorAll('.pattern-card.selected').forEach(c => {
        c.classList.remove('selected');
      });

      // Select this card
      card.classList.add('selected');
      tempSelection = item;
      continueBtn.disabled = false;
    });

    return card;
  }

  /**
   * Moves to next step in selection flow
   */
  function continueToNextStep() {
    if (!tempSelection) return;

    // Save the selection
    const type = selectionFlow[currentStepIndex];
    selected[type] = tempSelection;
    updateSlot(type, tempSelection);

    // Move to next step or finish
    if (currentStepIndex < 2) {
      currentStepIndex++;
      showSelectionStep();
    } else {
      // All 3 patterns selected, go to composition view
      finishSelection();
    }
  }

  /**
   * Goes back to previous step
   */
  function goBackStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      showSelectionStep();

      // Pre-select if already chosen
      const type = selectionFlow[currentStepIndex];
      if (selected[type]) {
        setTimeout(() => {
          const card = patternGrid.querySelector(`[data-pattern-id="${selected[type].id}"]`);
          if (card) {
            card.classList.add('selected');
            tempSelection = selected[type];
            continueBtn.disabled = false;
          }
        }, 100);
      }
    }
  }

  /**
   * Finishes selection and shows composition view
   */
  function finishSelection() {
    showView('composition');
    updateCompositionView();
    saveState(selected, tempoRange.value);
  }

  // ========== Slot Management ==========

  /**
   * Updates a slot with pattern data
   */
  function updateSlot(type, pattern) {
    const slotId = `${type}Slot`;
    const slot = document.getElementById(slotId);
    const slotContent = slot.querySelector('.slot-content');
    const changeBtn = slot.querySelector('.slot-change-btn');

    if (pattern) {
      // Fill slot
      slot.classList.remove('empty');
      slot.classList.add('filled');
      changeBtn.classList.remove('hidden');

      let detailsHTML = '';
      if (type === 'drum') {
        const patternStr = pattern.pattern || '';
        const gridHTML = Array.from({ length: 32 }, (_, i) => {
          const isOn = patternStr[i] === 'X';
          return `<div class="step ${isOn ? 'on' : ''}"></div>`;
        }).join('');
        detailsHTML = `<div class="grid grid-cols-8 gap-1.5 mt-3">${gridHTML}</div>`;
      } else if (type === 'bass') {
        detailsHTML = `
          <div class="mono text-base mt-2">${escapeHTML(pattern.prog || '')}</div>
          <div class="text-sm muted mt-1">${escapeHTML(pattern.key || '')}</div>
        `;
      } else {
        detailsHTML = `
          <div class="mono text-base mt-2">${escapeHTML(pattern.motif || '')}</div>
          <div class="text-sm muted mt-1">${escapeHTML(pattern.key || '')}</div>
        `;
      }

      slotContent.innerHTML = `
        <div class="border border-studio-700/20 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="font-semibold text-lg">${escapeHTML(pattern.title)}</div>
            <div class="text-xs muted">${pattern.bpm ? (pattern.bpm + ' BPM') : ''}</div>
          </div>
          <div class="text-sm muted mb-2">${escapeHTML(pattern.mood || '')}</div>
          ${detailsHTML}
        </div>
      `;
    } else {
      // Empty slot
      slot.classList.add('empty');
      slot.classList.remove('filled');
      changeBtn.classList.add('hidden');

      const labels = {
        drum: 'Add Drum Pattern',
        bass: 'Add Bass Pattern',
        lead: 'Add Lead Pattern'
      };

      slotContent.innerHTML = `
        <button data-slot="${type}" class="slot-add-btn w-full py-8 border-2 border-dashed border-studio-700/30 rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all">
          <div class="text-accent text-lg">+ ${labels[type]}</div>
        </button>
      `;

      // Re-attach event listener
      slotContent.querySelector('.slot-add-btn').addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.slot;
        startSelectionForSlot(type);
      });
    }
  }

  /**
   * Opens selection view to change a specific slot
   */
  function startSelectionForSlot(type) {
    selectionFlow = [type];
    currentStepIndex = 0;
    currentlySelectingType = type;

    // Update header
    const labels = {
      drum: 'Choose Your Drum Kit',
      bass: 'Choose Your Bass Pattern',
      lead: 'Choose Your Lead Melody'
    };
    selectionTitle.textContent = labels[type];
    selectionSubtitle.textContent = 'Update Selection';

    // Update progress - hide dots for single selection
    progressDots.forEach(dot => dot.style.visibility = 'hidden');

    // Load patterns
    const patterns = type === 'drum' ? drums : (type === 'bass' ? basses : leads);
    renderPatternGrid(patterns, type);

    // Show selection view
    showView('selection');

    // Update buttons
    backBtn.disabled = false; // Can go back to composition
    backBtn.textContent = '← Back to Composition';
    continueBtn.disabled = true;
    continueBtn.textContent = 'Update →';

    // Pre-select current if exists
    if (selected[type]) {
      setTimeout(() => {
        const card = patternGrid.querySelector(`[data-pattern-id="${selected[type].id}"]`);
        if (card) {
          card.classList.add('selected');
          tempSelection = selected[type];
          continueBtn.disabled = false;
        }
      }, 100);
    }
  }

  /**
   * Updates the composition view state
   */
  function updateCompositionView() {
    updateSlot('drum', selected.drum);
    updateSlot('bass', selected.bass);
    updateSlot('lead', selected.lead);

    // Enable/disable play button
    const hasAnyPattern = selected.drum || selected.bass || selected.lead;
    playBtn.disabled = !hasAnyPattern;
    exportMenuBtn.disabled = !hasAnyPattern;
  }

  // ========== Audio Playback ==========

  /**
   * Starts audio playback
   */
  async function startPlayback() {
    if (!selected.drum && !selected.bass && !selected.lead) {
      toast('Please add at least one pattern to play');
      return;
    }

    await Tone.start();
    Tone.Transport.bpm.value = parseInt(tempoRange.value);

    stopSequences(sequences);
    sequences = createSequences(selected, synths);

    Tone.Transport.start();
    isPlaying = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    toast('▶ Playing');
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
  }

  // ========== State Management ==========

  /**
   * Resets the entire application
   */
  function resetApp() {
    stopPlayback();

    selected = { drum: null, bass: null, lead: null };
    selectionFlow = [];
    currentStepIndex = 0;
    tempSelection = null;

    clearState();
    showView('start');

    // Reset tempo
    tempoRange.value = 170;
    tempoLabel.textContent = '170 BPM';

    toast('Reset to start');
  }

  /**
   * Restores session state (optional for P3)
   */
  function restoreState() {
    const state = loadState();
    if (!state || !state.selectedIds) return;

    let hasRestoredAny = false;

    if (state.selectedIds.drum) {
      const pattern = drums.find(d => d.id === state.selectedIds.drum);
      if (pattern) {
        selected.drum = pattern;
        hasRestoredAny = true;
      }
    }

    if (state.selectedIds.bass) {
      const pattern = basses.find(b => b.id === state.selectedIds.bass);
      if (pattern) {
        selected.bass = pattern;
        hasRestoredAny = true;
      }
    }

    if (state.selectedIds.lead) {
      const pattern = leads.find(l => l.id === state.selectedIds.lead);
      if (pattern) {
        selected.lead = pattern;
        hasRestoredAny = true;
      }
    }

    if (state.tempo) {
      tempoRange.value = state.tempo;
      tempoLabel.textContent = state.tempo + ' BPM';
    }

    if (hasRestoredAny) {
      showView('composition');
      updateCompositionView();
      toast('Session restored');
    }
  }

  // ========== Event Listeners ==========

  // Start screen - category selection
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      startSelectionFlow(category);
    });
  });

  // Selection screen navigation
  backBtn.addEventListener('click', () => {
    if (selectionFlow.length === 1) {
      // Single slot update, go back to composition
      progressDots.forEach(dot => dot.style.visibility = 'visible');
      backBtn.textContent = '← Back';
      continueBtn.textContent = 'Continue →';
      showView('composition');
    } else {
      // Multi-step flow, go to previous step
      goBackStep();
    }
  });

  continueBtn.addEventListener('click', () => {
    if (selectionFlow.length === 1) {
      // Single slot update
      const type = selectionFlow[0];
      selected[type] = tempSelection;
      updateSlot(type, tempSelection);
      saveState(selected, tempoRange.value);

      progressDots.forEach(dot => dot.style.visibility = 'visible');
      backBtn.textContent = '← Back';
      continueBtn.textContent = 'Continue →';
      showView('composition');
      updateCompositionView();
    } else {
      // Multi-step flow
      continueToNextStep();
    }
  });

  // Composition screen - slot add buttons (delegated via updateSlot)
  slotChangeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.slot;
      startSelectionForSlot(type);
    });
  });

  // Playback controls
  playBtn.addEventListener('click', startPlayback);
  stopBtn.addEventListener('click', stopPlayback);

  tempoRange.addEventListener('input', () => {
    tempoLabel.textContent = tempoRange.value + ' BPM';
    if (isPlaying) {
      Tone.Transport.bpm.value = parseInt(tempoRange.value);
    }
    saveState(selected, tempoRange.value);
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    if (confirm('Start over? This will clear your current composition.')) {
      resetApp();
    }
  });

  // Export menu toggle
  exportMenuBtn.addEventListener('click', () => {
    exportMenu.classList.toggle('hidden');
  });

  // Export actions
  document.getElementById('copySelection').addEventListener('click', () => {
    const formatted = formatTriplet(selected, tempoRange.value);
    navigator.clipboard.writeText(formatted);
    toast('📋 Copied as LLM format');
  });

  document.getElementById('downloadSelection').addEventListener('click', () => {
    const out = { tempo: tempoRange.value, selected };
    downloadJSON(out, `beatgrid-selection-${Date.now()}.json`);
    toast('💾 Downloaded as JSON');
  });

  document.getElementById('exportAll').addEventListener('click', () => {
    const out = { tempo: tempoRange.value, drums, basses, leads };
    downloadJSON(out, `beatgrid-all-${Date.now()}.json`);
    toast('📦 All patterns exported');
  });

  document.getElementById('saveGist').addEventListener('click', async () => {
    const token = prompt('Enter GitHub personal access token:');
    if (!token) return;

    const payload = {
      description: 'BeatGrid composition',
      public: false,
      files: {
        'beatgrid.json': {
          content: JSON.stringify({ tempo: tempoRange.value, selected, drums, basses, leads }, null, 2)
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
        toast('🔗 Saved to Gist');
        window.open(j.html_url, '_blank');
      } else {
        toast('Failed to save Gist');
      }
    } catch (err) {
      toast('Error saving Gist');
    }
  });

  // ========== Initialize ==========

  // Try to restore previous session
  restoreState();

  // ========== Utility Functions ==========

  /**
   * Shows toast notification
   */
  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.className = 'fixed right-6 bottom-6 bg-studio-800/90 backdrop-blur text-white px-5 py-3 rounded-lg shadow-xl z-50 border border-studio-700/40';
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, 2200);
  }

  /**
   * Escapes HTML to prevent XSS
   */
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Gets emoji for type
   */
  function getEmoji(type) {
    const emojis = { drum: '🥁', bass: '🎸', lead: '🎹' };
    return emojis[type] || '';
  }
}
