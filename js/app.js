// app.js
export function renderApp({ drums, basses, leads, icons }) {
  const drumGrid = document.getElementById('drumGrid');
  const bassGrid = document.getElementById('bassGrid');
  const leadGrid = document.getElementById('leadGrid');
  const tempoRange = document.getElementById('tempo');
  const tempoLabel = document.getElementById('tempoLabel');

  let selected = { drum:null, bass:null, lead:null };

  tempoRange.addEventListener('input', ()=> tempoLabel.textContent = tempoRange.value + ' BPM');

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
