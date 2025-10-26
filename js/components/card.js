/**
 * Card Component
 * Renders individual pattern cards with selection and export functionality
 */

import { formatForLLM, downloadJSON, escapeHTML } from '../utils/formatters.js';

/**
 * Creates a pattern card element
 * @param {object} item - Pattern data object
 * @param {string} type - Pattern type (drum, bass, lead)
 * @param {object} icons - Icon SVG functions
 * @param {function} onSelect - Callback when card is selected
 * @param {function} toast - Toast notification function
 * @returns {HTMLElement} Card element
 */
export function createCard(item, type, icons, onSelect, toast) {
  const card = document.createElement('div');
  card.className = 'card p-4 rounded-xl';
  card.dataset.patternId = item.id; // Store pattern ID for state restoration

  card.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <div class="text-sm font-semibold">${escapeHTML(item.title)}</div>
          <div class="text-xs muted mono">${item.bpm ? (item.bpm + ' BPM') : (item.key || '')}</div>
        </div>
        <div class="text-sm muted mt-1">${escapeHTML(item.mood || '')}</div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <div class="icon-btn text-accent">${icons[item.icon] ? icons[item.icon]() : ''}</div>
        <div class="flex gap-2 mt-2">
          <button class="copyBtn px-2 py-1 text-xs rounded-md bg-studio-800/40 hover:bg-studio-800/60 transition-colors">Copy</button>
          <button class="exportBtn px-2 py-1 text-xs rounded-md bg-studio-800/40 hover:bg-studio-800/60 transition-colors">Export</button>
        </div>
      </div>
    </div>
  `;

  // Create details area based on type
  const detail = createDetailSection(item, type);
  card.appendChild(detail);

  // Add selection handler
  card.addEventListener('click', (e) => {
    const previousSelected = card.parentElement.querySelector('.ring-2');
    if (previousSelected) previousSelected.classList.remove('ring-2', 'ring-accent');
    card.classList.add('ring-2', 'ring-accent');
    onSelect(item, type);
  });

  // Add copy button handler
  const copyBtn = card.querySelector('.copyBtn');
  copyBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const text = formatForLLM(item, type);
    navigator.clipboard.writeText(text);
    toast('Copied LLM format');
  });

  // Add export button handler
  const exportBtn = card.querySelector('.exportBtn');
  exportBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    downloadJSON(item, `${type}-${item.id}.json`);
  });

  return card;
}

/**
 * Creates the detail section for a card based on type
 * @param {object} item - Pattern data object
 * @param {string} type - Pattern type
 * @returns {HTMLElement} Detail element
 */
function createDetailSection(item, type) {
  const detail = document.createElement('div');
  detail.className = 'mt-3';

  if (type === 'drum') {
    const pattern = item.pattern || '';
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-8 gap-2';

    for (let i = 0; i < 32; i++) {
      const step = document.createElement('div');
      step.className = 'step ' + (pattern[i] === 'X' ? 'on' : '');
      step.title = `Step ${i + 1}`;
      step.tabIndex = 0; // Enable keyboard navigation
      step.setAttribute('role', 'button');
      step.setAttribute('aria-label', `Step ${i + 1}, ${pattern[i] === 'X' ? 'active' : 'inactive'}`);
      step.innerHTML = `<span>${i + 1}</span>`;
      grid.appendChild(step);
    }
    detail.appendChild(grid);
  } else if (type === 'bass') {
    detail.innerHTML = `
      <div class="mono mt-1">${escapeHTML(item.prog || '')}</div>
      <div class="muted text-xs mt-1">${escapeHTML(item.key || '')} • ${escapeHTML(item.mood || '')}</div>
    `;
  } else {
    detail.innerHTML = `
      <div class="mono mt-1">${escapeHTML(item.motif || '')}</div>
      <div class="muted text-xs mt-1">${escapeHTML(item.key || '')} • ${escapeHTML(item.mood || '')}</div>
    `;
  }

  return detail;
}

/**
 * Highlights a card by pattern ID
 * @param {HTMLElement} grid - Grid container element
 * @param {string} id - Pattern ID to highlight
 */
export function highlightCard(grid, id) {
  const cards = grid.querySelectorAll('.card');
  cards.forEach(card => {
    if (card.dataset.patternId === id) {
      card.classList.add('ring-2', 'ring-accent');
    }
  });
}
