// app.js
export function renderApp({ drums, basses, leads, icons }) {
  const drumGrid = document.getElementById('drumGrid');
  const bassGrid = document.getElementById('bassGrid');
  const leadGrid = document.getElementById('leadGrid');
  const tempoRange = document.getElementById('tempo');
  const tempoLabel = document.getElementById('tempoLabel');
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');

  let selected = { drum:null, bass:null, lead:null };
  let isPlaying = false;
  let drumSequence = null;
  let bassSequence = null;
  let leadSequence = null;

  // ========== Tone.js Audio Setup ==========

  // Drum synths (kick, snare, hihat simulation)
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  }).toDestination();

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
  }).toDestination();

  const hihat = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();

  // Bass synth
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.8, baseFrequency: 200, octaves: 2.6 }
  }).toDestination();

  // Lead synth
  const lead = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.8 }
  }).toDestination();

  // Set initial volume levels
  kick.volume.value = -6;
  snare.volume.value = -10;
  hihat.volume.value = -20;
  bass.volume.value = -8;
  lead.volume.value = -12;

  // ========== Playback Functions ==========

  function startPlayback() {
    if (!selected.drum && !selected.bass && !selected.lead) {
      toast('Please select at least one pattern to play');
      return;
    }

    Tone.Transport.bpm.value = parseInt(tempoRange.value);

    // Stop any existing sequences
    stopPlayback();

    // Setup drum sequence
    if (selected.drum && selected.drum.pattern) {
      const pattern = selected.drum.pattern;
      drumSequence = new Tone.Sequence((time, step) => {
        const char = pattern[step];
        if (char === 'X') {
          // Alternate between kick, snare, and hihat for variety
          if (step % 4 === 0) kick.triggerAttackRelease('C1', '8n', time);
          else if (step % 4 === 2) snare.triggerAttackRelease('16n', time);
          else hihat.triggerAttackRelease('32n', time);
        }
      }, [...Array(32).keys()], '16n');
      drumSequence.start(0);
    }

    // Setup bass sequence (simple root note pattern)
    if (selected.bass && selected.bass.prog) {
      const chordRoot = parseChordRoot(selected.bass.prog);
      bassSequence = new Tone.Sequence((time, note) => {
        bass.triggerAttackRelease(note, '4n', time);
      }, chordRoot, '2n');
      bassSequence.start(0);
    }

    // Setup lead sequence
    if (selected.lead && selected.lead.motif) {
      const notes = parseMotifToNotes(selected.lead.motif, selected.lead.key);
      leadSequence = new Tone.Sequence((time, note) => {
        if (note) lead.triggerAttackRelease(note, '8n', time);
      }, notes, '8n');
      leadSequence.start(0);
    }

    Tone.Transport.start();
    isPlaying = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    playBtn.classList.add('opacity-50');
    stopBtn.classList.remove('opacity-50');
    toast('Playback started');
  }

  function stopPlayback() {
    if (drumSequence) { drumSequence.stop(); drumSequence.dispose(); drumSequence = null; }
    if (bassSequence) { bassSequence.stop(); bassSequence.dispose(); bassSequence = null; }
    if (leadSequence) { leadSequence.stop(); leadSequence.dispose(); leadSequence = null; }

    Tone.Transport.stop();
    Tone.Transport.cancel();
    isPlaying = false;
    playBtn.disabled = false;
    stopBtn.disabled = true;
    playBtn.classList.remove('opacity-50');
    stopBtn.classList.add('opacity-50');
  }

  // Helper to extract root notes from chord progression
  function parseChordRoot(prog) {
    const chordMap = {
      'C': 'C2', 'Cm': 'C2', 'D': 'D2', 'Dm': 'D2', 'E': 'E2', 'Em': 'E2',
      'F': 'F2', 'Fm': 'F2', 'G': 'G2', 'Gm': 'G2', 'A': 'A2', 'Am': 'A2',
      'B': 'B2', 'Bm': 'B2', 'Bb': 'A#2', 'Bbm': 'A#2', 'Ab': 'G#2',
      'Eb': 'D#2', 'Ebm': 'D#2', 'Db': 'C#2', 'Gb': 'F#2'
    };
    const chords = prog.split('-').map(c => c.trim());
    return chords.map(chord => chordMap[chord] || 'C2');
  }

  // Helper to convert motif degrees to actual notes
  function parseMotifToNotes(motif, key) {
    const scaleMap = {
      'C major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
      'D major': ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5'],
      'E major': ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5'],
      'F major': ['F4', 'G4', 'A4', 'A#4', 'C5', 'D5', 'E5'],
      'G major': ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5'],
      'A major': ['A4', 'B4', 'C#5', 'D5', 'E5', 'F#5', 'G#5'],
      'A minor': ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'],
      'E minor': ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5'],
      'D minor': ['D4', 'E4', 'F4', 'G4', 'A4', 'A#4', 'C5'],
      'C minor': ['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4'],
      'E minor pentatonic': ['E4', 'G4', 'A4', 'B4', 'D5'],
      'F minor pentatonic': ['F4', 'G#4', 'A#4', 'C5', 'D#5']
    };

    const scale = scaleMap[key] || scaleMap['C major'];
    const degrees = motif.split('-').map(d => d.trim());

    return degrees.map(deg => {
      const num = parseInt(deg.replace(/[♭#]/g, ''));
      if (isNaN(num)) return null;
      const idx = (num - 1) % scale.length;
      return scale[idx];
    });
  }

  // ========== Event Listeners ==========

  playBtn.addEventListener('click', async () => {
    await Tone.start(); // Required for browser audio context
    startPlayback();
  });

  stopBtn.addEventListener('click', () => {
    stopPlayback();
    toast('Playback stopped');
  });

  tempoRange.addEventListener('input', ()=> {
    tempoLabel.textContent = tempoRange.value + ' BPM';
    if (isPlaying) {
      Tone.Transport.bpm.value = parseInt(tempoRange.value);
    }
  });

  function makeCard(item, type){
    const card = document.createElement('div');
    card.className = 'card p-4 rounded-xl';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <div class="text-sm font-semibold">${escapeHTML(item.title)}</div>
            <div class="text-xs muted mono">${item.bpm? (item.bpm + ' BPM') : (item.key || '')}</div>
          </div>
          <div class="text-sm muted mt-1">${escapeHTML(item.mood || item.mood || '')}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="icon-btn text-accent">${ icons[item.icon] ? icons[item.icon]() : '' }</div>
          <div class="flex gap-2 mt-2">
            <button class="copyBtn px-2 py-1 text-xs rounded-md bg-studio-800/40">Copy</button>
            <button class="exportBtn px-2 py-1 text-xs rounded-md bg-studio-800/40">Export</button>
          </div>
        </div>
      </div>
    `;
    // details area
    const detail = document.createElement('div');
    detail.className = 'mt-3';
    if(type === 'drum'){
      const pattern = item.pattern || '';
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-8 gap-2';
      for(let i=0;i<32;i++){
        const s = document.createElement('div');
        s.className = 'step ' + (pattern[i]==='X' ? 'on' : '');
        s.title = (i+1).toString();
        s.innerHTML = '<span></span>';
        grid.appendChild(s);
      }
      detail.appendChild(grid);
    } else if(type === 'bass'){
      detail.innerHTML = `<div class="mono mt-1">${escapeHTML(item.prog || '')}</div>
                          <div class="muted text-xs mt-1">${escapeHTML(item.key || '')} • ${escapeHTML(item.mood || '')}</div>`;
    } else {
      detail.innerHTML = `<div class="mono mt-1">${escapeHTML(item.motif || '')}</div>
                          <div class="muted text-xs mt-1">${escapeHTML(item.key || '')} • ${escapeHTML(item.mood || '')}</div>`;
    }
    card.appendChild(detail);

    // selection on click
    card.addEventListener('click', (e)=>{
      const previousSelected = card.parentElement.querySelector('.ring-2');
      if(previousSelected) previousSelected.classList.remove('ring-2','ring-accent');
      card.classList.add('ring-2','ring-accent');
      if(type==='drum') selected.drum = item;
      if(type==='bass') selected.bass = item;
      if(type==='lead') selected.lead = item;
    });

    // button handlers
    const copyBtn = card.querySelector('.copyBtn');
    copyBtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      const text = formatForLLM(item, type);
      navigator.clipboard.writeText(text);
      toast('Copied LLM format');
    });

    const exportBtn = card.querySelector('.exportBtn');
    exportBtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      downloadJSON(item, `${type}-${item.id}.json`);
    });

    return card;
  }

  // render
  drums.forEach(d => drumGrid.appendChild(makeCard(d,'drum')));
  basses.forEach(b => bassGrid.appendChild(makeCard(b,'bass')));
  leads.forEach(l => leadGrid.appendChild(makeCard(l,'lead')));

  // header actions
  document.getElementById('exportAll').addEventListener('click', ()=>{
    const out = { tempo: tempoRange.value, drums, basses, leads };
    downloadJSON(out, `beatgrid-${Date.now()}.json`);
  });

  document.getElementById('copySelection').addEventListener('click', ()=> {
    const formatted = formatTriplet(selected, tempoRange.value);
    navigator.clipboard.writeText(formatted);
    toast('Selected triplet copied for LLM');
  });

  document.getElementById('downloadSelection').addEventListener('click', ()=>{
    const out = { tempo: tempoRange.value, selected };
    downloadJSON(out, `selection-${Date.now()}.json`);
  });

  document.getElementById('formatClaude').addEventListener('click', ()=> {
    const formatted = formatAllForLLM({ drums, basses, leads });
    navigator.clipboard.writeText(formatted);
    toast('Full dataset copied (LLM format)');
  });

  document.getElementById('seedRandom').addEventListener('click', ()=> {
    // simple shuffle: pick 3 random and highlight them
    const pick = (arr)=> arr[Math.floor(Math.random()*arr.length)];
    selected.drum = pick(drums); selected.bass = pick(basses); selected.lead = pick(leads);
    toast('Random triplet selected — click Copy Selected to export.');
  });

  document.getElementById('saveGist').addEventListener('click', async ()=>{
    const token = prompt('Enter a GitHub personal access token with gist scope (or cancel to skip)');
    if(!token) return;
    const payload = { description: 'BeatGrid export', public: false, files: { 'beatgrid.json': { content: JSON.stringify({ drums,basses,leads },null,2) } } };
    try {
      const res = await fetch('https://api.github.com/gists', {
        method:'POST', headers:{ Authorization: 'token ' + token, 'Content-Type':'application/json' }, body: JSON.stringify(payload)
      });
      const j = await res.json();
      if(j.html_url) { toast('Gist saved: ' + j.html_url); window.open(j.html_url,'_blank'); }
      else toast('Gist save failed');
    } catch(err){ toast('Error saving gist'); }
  });

  // helpers
  function formatForLLM(item, type){
    if(type==='drum') return `Drum Loop — ${item.title}\nBPM: ${item.bpm}\nMood: ${item.mood}\nPattern: ${item.pattern}\n\nConvert to: kick/snare/hat step map (32 steps), suitable for 2-bar loop.`;
    if(type==='bass') return `Bass / Rhythm — ${item.title}\nKey: ${item.key}\nProgression: ${item.prog}\nMood: ${item.mood}\n\nConvert to: bassline suggestions, octave range, rhythmic pattern at 16th note resolution.`;
    return `Lead — ${item.title}\nKey: ${item.key}\nMotif: ${item.motif}\nMood: ${item.mood}\n\nConvert to: 8 or 16 bar lead melody in midi-friendly degrees.`;
  }

  function formatTriplet(sel, tempo){
    return `Tempo: ${tempo} BPM\n\nDrum:\n${sel.drum? (sel.drum.title + ' • ' + sel.drum.pattern) : '—'}\n\nBass:\n${sel.bass? (sel.bass.title + ' • ' + sel.bass.prog + ' • ' + sel.bass.key) : '—'}\n\nLead:\n${sel.lead? (sel.lead.title + ' • ' + sel.lead.motif + ' • ' + sel.lead.key) : '—'}\n\nPlease expand each into MIDI-ready step maps and a short melody in scale degrees.`;
  }

  function formatAllForLLM(all){
    let out = `BeatGrid dataset — tempo range 160-180 BPM\n\nDrums:\n`;
    all.drums.forEach(d=> out += `- ${d.title} • ${d.bpm} BPM • ${d.mood}\n  pattern: ${d.pattern}\n`);
    out += `\nBasses:\n`;
    all.basses.forEach(b=> out += `- ${b.title} • ${b.key} • ${b.prog} • ${b.mood}\n`);
    out += `\nLeads:\n`;
    all.leads.forEach(l=> out += `- ${l.title} • ${l.key} • ${l.motif} • ${l.mood}\n`);
    out += `\nInstruction: For each item, produce: (1) a MIDI step map (where applicable), (2) suggested instrument patch, (3) suggested octave and velocity ranges.`;
    return out;
  }

  function downloadJSON(obj, filename){
    const blob = new Blob([JSON.stringify(obj,null,2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }

  function toast(msg){
    // simple ephemeral notification
    const t = document.createElement('div');
    t.textContent = msg;
    t.className = 'fixed right-6 bottom-6 bg-studio-800/80 text-white px-4 py-2 rounded-md';
    document.body.appendChild(t);
    setTimeout(()=> t.remove(), 2400);
  }

  function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
}
