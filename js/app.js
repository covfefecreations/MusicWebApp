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
    if(type==='drum') {
      return `# Drum Pattern: ${item.title}

**ID:** \`${item.id}\`
**BPM:** ${item.bpm}
**Mood:** ${item.mood}
**Icon:** ${item.icon}

## Pattern (32 steps, 2 bars)
\`\`\`
${item.pattern}
\`\`\`

## Interpretation Guide
- Each position represents a 16th note
- 'X' = hit, '-' = rest
- Total duration: 2 bars at ${item.bpm} BPM

## Suggested Mapping
Convert this pattern to:
1. Kick/snare/hihat step map (32 steps)
2. Velocity variations (accent marks)
3. Suitable for 2-bar loop in modern electronic music production
`;
    }
    if(type==='bass') {
      return `# Bass Pattern: ${item.title}

**ID:** \`${item.id}\`
**Key:** ${item.key}
**Progression:** ${item.prog}
**Mood:** ${item.mood}
**Icon:** ${item.icon}

## Chord Progression
\`\`\`
${item.prog}
\`\`\`

## Production Notes
- Key signature: ${item.key}
- Mood/character: ${item.mood}

## Suggested Implementation
Convert this to:
1. Bassline note sequence with root notes from chord progression
2. Octave range: typically C1-C3
3. Rhythmic pattern at 16th note resolution
4. Synth patch suggestions (e.g., sawtooth, sub bass, etc.)
`;
    }
    return `# Lead Melody: ${item.title}

**ID:** \`${item.id}\`
**Key:** ${item.key}
**Motif:** ${item.motif}
**Mood:** ${item.mood}
**Icon:** ${item.icon}

## Melodic Motif (Scale Degrees)
\`\`\`
${item.motif}
\`\`\`

## Musical Context
- Scale/mode: ${item.key}
- Character: ${item.mood}
- Degrees are relative to the scale root

## Suggested Implementation
Convert this to:
1. 8 or 16 bar lead melody
2. MIDI-friendly note sequence
3. Typical octave range: C4-C6
4. Consider adding passing tones and rhythmic variations
`;
  }

  function formatTriplet(sel, tempo){
    let output = `# BeatGrid Pattern Export

## Session Info
- **Tempo:** ${tempo} BPM
- **Export Date:** ${new Date().toISOString().split('T')[0]}

---

`;

    if (sel.drum) {
      output += `## 🥁 Drum Pattern: ${sel.drum.title}

- **BPM:** ${sel.drum.bpm}
- **Mood:** ${sel.drum.mood}
- **Pattern:**
  \`\`\`
  ${sel.drum.pattern}
  \`\`\`

`;
    } else {
      output += `## 🥁 Drum Pattern
No drum pattern selected.

`;
    }

    if (sel.bass) {
      output += `## 🎸 Bass Pattern: ${sel.bass.title}

- **Key:** ${sel.bass.key}
- **Progression:** ${sel.bass.prog}
- **Mood:** ${sel.bass.mood}

`;
    } else {
      output += `## 🎸 Bass Pattern
No bass pattern selected.

`;
    }

    if (sel.lead) {
      output += `## 🎹 Lead Melody: ${sel.lead.title}

- **Key:** ${sel.lead.key}
- **Motif:** ${sel.lead.motif}
- **Mood:** ${sel.lead.mood}

`;
    } else {
      output += `## 🎹 Lead Melody
No lead pattern selected.

`;
    }

    output += `---

## 💡 Production Instructions

Please expand this musical sketch into production-ready elements:

1. **Drum Pattern** → Convert to kick/snare/hat MIDI step map (32 steps)
2. **Bass Pattern** → Create bassline with root notes, rhythmic pattern at 16th note resolution
3. **Lead Melody** → Expand to 8-16 bar melody with scale degrees converted to MIDI notes

Suggested workflow:
- Map patterns to your DAW or sequencer
- Apply appropriate synth patches
- Add velocity variations and humanization
- Consider adding fills and transitions
`;

    return output;
  }

  function formatAllForLLM(all){
    let output = `# BeatGrid Complete Dataset

**Tempo Range:** 160-180 BPM
**Export Date:** ${new Date().toISOString().split('T')[0]}
**Total Patterns:** ${all.drums.length} drums, ${all.basses.length} basses, ${all.leads.length} leads

---

## 🥁 Drum Patterns

`;
    all.drums.forEach(d => {
      output += `### ${d.title} (\`${d.id}\`)
- **BPM:** ${d.bpm}
- **Mood:** ${d.mood}
- **Pattern:** \`${d.pattern}\`

`;
    });

    output += `---

## 🎸 Bass Patterns

`;
    all.basses.forEach(b => {
      output += `### ${b.title} (\`${b.id}\`)
- **Key:** ${b.key}
- **Progression:** ${b.prog}
- **Mood:** ${b.mood}

`;
    });

    output += `---

## 🎹 Lead Melodies

`;
    all.leads.forEach(l => {
      output += `### ${l.title} (\`${l.id}\`)
- **Key:** ${l.key}
- **Motif:** ${l.motif}
- **Mood:** ${l.mood}

`;
    });

    output += `---

## 📋 Data Processing Instructions

This dataset contains modular musical patterns suitable for:

1. **Music Production** - Use as building blocks for electronic music
2. **AI Training** - Train generative models on pattern structures
3. **LLM Context** - Provide to language models for music generation tasks
4. **DAW Integration** - Import into digital audio workstations

### Recommended Processing Steps

For each pattern, consider generating:

1. **MIDI Data**
   - Convert patterns to MIDI step sequences
   - Apply appropriate note velocities
   - Map to standard MIDI note numbers

2. **Audio Synthesis**
   - Assign synthesizer patches (kick, snare, bass, lead)
   - Set octave ranges (drums: C1-C2, bass: C1-C3, lead: C4-C6)
   - Apply envelope and filter modulation

3. **Arrangement**
   - Combine compatible patterns (match key signatures)
   - Create variations and fills
   - Add transitions and effects

### Pattern Compatibility Guide

**Key Signature Matching:**
- Major keys: C, D, E, F, G, A, Bb major
- Minor keys: A, E, D, C, F minor
- Modes: Phrygian, Lydian
- Pentatonic: E minor, F minor

**Tempo Ranges:**
- Slow: 160-165 BPM
- Medium: 166-172 BPM
- Fast: 173-180 BPM
`;

    return output;
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
