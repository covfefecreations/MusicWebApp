/**
 * Export and Formatting Utilities
 * Functions for formatting patterns for LLM consumption and JSON export
 */

import {
  extractMotifTags,
  categorizeMotifs,
  generatePromptTemplates,
  analyzePatternDensity
} from './motifTags.js';

/**
 * Formats a single pattern for LLM consumption with enhanced motif tagging
 * @param {object} item - Pattern object
 * @param {string} type - Pattern type (drum, bass, lead)
 * @param {object} context - Optional context {drums, basses, leads} for compatibility
 * @returns {string} Formatted markdown string
 */
export function formatForLLM(item, type, context = null) {
  const motifTags = extractMotifTags(item.mood);
  const categorized = categorizeMotifs(motifTags);
  const prompts = generatePromptTemplates(item, type);
  if (type === 'drum') {
    const density = analyzePatternDensity(item.pattern);

    return `# 🥁 Drum Pattern: ${item.title}

**ID:** \`${item.id}\` | **BPM:** ${item.bpm} | **Density:** ${density.percentage}% (${density.complexity})

## 🏷️ Motif Tags

**Raw Mood:** ${item.mood}

**Categorized Motifs:**
${Object.entries(categorized).filter(([_, tags]) => tags.length > 0).map(([cat, tags]) =>
  `- **${cat.charAt(0).toUpperCase() + cat.slice(1)}:** ${tags.join(', ')}`
).join('\n') || '- No categorized motifs'}

## 📊 Pattern Analysis

**Rhythm Grid** (32 steps, 2 bars):
\`\`\`
${item.pattern}
\`\`\`

**Density Metrics:**
- Hits: ${density.hits} / ${density.total} steps (${density.percentage}%)
- Complexity: ${density.complexity}
- Rests: ${density.rests} steps
- Character: ${motifTags.join(' • ')}

## 🎯 Interpretation Guide

- Each position represents a 16th note
- 'X' = hit, '-' = rest
- Total duration: 2 bars at ${item.bpm} BPM
- Tempo category: ${item.bpm < 165 ? 'Slow' : item.bpm < 173 ? 'Medium' : 'Fast'}

## 🔧 Suggested Implementation

**Mapping Strategy:**
1. Kick drum on downbeats (steps 0, 8, 16, 24)
2. Snare on backbeats (steps 8, 24)
3. Hi-hat on off-beats and fills
4. Layer with ${density.complexity} velocity variations

**Sound Design:**
- Kick: Deep sub punch, ${motifTags[0]?.toLowerCase() || 'standard'} character
- Snare: ${motifTags.includes('Sharp') || motifTags.includes('Crisp') ? 'Bright, crisp' : 'Warm, rounded'} tone
- Hi-hat: ${motifTags.includes('Shimmery') ? 'Shimmery, metallic' : 'Tight, controlled'} timbre

## 💡 AI Generation Prompts

${prompts.map((p, i) => `${i + 1}. "${p}"`).join('\n\n')}

## 🔗 Production Context

- **Genre fit:** ${motifTags.includes('Dark') ? 'Techno, Industrial, Dark Ambient' : motifTags.includes('Bright') ? 'House, Dance, Pop' : 'Electronic, Experimental'}
- **Use case:** ${density.complexity === 'sparse' ? 'Minimal sections, breakdowns' : density.complexity === 'dense' ? 'Peak moments, drops' : 'Verses, grooves'}
- **Layering:** Works well with ${density.complexity === 'sparse' ? 'melodic elements' : 'bass-heavy arrangements'}
`;
  }
  if (type === 'bass') {
    return `# 🎸 Bass Pattern: ${item.title}

**ID:** \`${item.id}\` | **Key:** ${item.key}

## 🏷️ Motif Tags

**Raw Mood:** ${item.mood}

**Categorized Motifs:**
${Object.entries(categorized).filter(([_, tags]) => tags.length > 0).map(([cat, tags]) =>
  `- **${cat.charAt(0).toUpperCase() + cat.slice(1)}:** ${tags.join(', ')}`
).join('\n') || '- No categorized motifs'}

## 🎹 Harmonic Structure

**Chord Progression:**
\`\`\`
${item.prog}
\`\`\`

**Key Analysis:**
- Scale/Key: ${item.key}
- Character: ${motifTags.join(' • ')}
- Chord count: ${item.prog.split('-').length} chords
- Harmonic rhythm: ${item.prog.split('-').length === 4 ? 'Standard (1 chord per bar)' : 'Varied'}

## 🔧 Suggested Implementation

**Bassline Approach:**
1. Root note movement following: ${item.prog}
2. Octave range: C1-C3 (sub-bass to mid-bass)
3. Rhythmic density: 16th note resolution with rests
4. Movement style: ${motifTags.includes('Driving') || motifTags.includes('Urgent') ? 'Active, syncopated' : 'Steady, foundational'}

**Sound Design:**
- Waveform: ${motifTags.includes('Warm') ? 'Sine/triangle (warm sub)' : motifTags.includes('Funky') ? 'Sawtooth (bright bass)' : 'Sawtooth + sub layer'}
- Filter: ${motifTags.includes('Dark') ? 'Low-pass, subtle resonance' : 'Band-pass for clarity'}
- Envelope: ${motifTags.includes('Punchy') ? 'Short decay, pluck-style' : 'Sustained, legato'}
- Effects: ${motifTags.includes('Wide') ? 'Stereo widening on mids' : 'Mono below 120Hz'}

## 💡 AI Generation Prompts

${prompts.map((p, i) => `${i + 1}. "${p}"`).join('\n\n')}

## 🔗 Production Context

- **Genre fit:** ${motifTags.includes('Funky') ? 'Funk, Nu-Disco, House' : motifTags.includes('Dark') ? 'Techno, Industrial, Bass Music' : 'Electronic, Pop, R&B'}
- **Layering:** Pair with ${motifTags.includes('Sparse') ? 'full drum kit' : 'minimal percussion'}
- **Arrangement:** ${motifTags.includes('Driving') ? 'Sustain throughout verses and choruses' : 'Drop out for dynamic variation'}
`;
  }
  return `# 🎹 Lead Melody: ${item.title}

**ID:** \`${item.id}\` | **Key:** ${item.key}

## 🏷️ Motif Tags

**Raw Mood:** ${item.mood}

**Categorized Motifs:**
${Object.entries(categorized).filter(([_, tags]) => tags.length > 0).map(([cat, tags]) =>
  `- **${cat.charAt(0).toUpperCase() + cat.slice(1)}:** ${tags.join(', ')}`
).join('\n') || '- No categorized motifs'}

## 🎵 Melodic Structure

**Motif** (Scale Degrees):
\`\`\`
${item.motif}
\`\`\`

**Motif Analysis:**
- Scale/Mode: ${item.key}
- Degree count: ${item.motif.split('-').length} notes
- Range: ${item.motif.split('-')[0]} to ${item.motif.split('-').slice(-1)[0]}
- Contour: ${item.motif.includes('5-3-1') || item.motif.includes('7-5-3') ? 'Descending' : item.motif.includes('1-3-5') || item.motif.includes('3-5-7') ? 'Ascending' : 'Mixed'}
- Character: ${motifTags.join(' • ')}

## 🔧 Suggested Implementation

**Melodic Development:**
1. Expand motif to 8 or 16 bar phrase
2. Octave range: C4-C6 (sweet spot for leads)
3. Add passing tones between scale degrees
4. Rhythmic variation: ${motifTags.includes('Upward') || motifTags.includes('Dreamy') ? 'Flowing, legato' : motifTags.includes('Sharp') || motifTags.includes('Aggressive') ? 'Staccato, rhythmic' : 'Mixed articulation'}

**Sound Design:**
- Synth type: ${motifTags.includes('Ethereal') || motifTags.includes('Dreamy') ? 'Pad, reverb-heavy' : motifTags.includes('Sharp') ? 'Pluck, bright attack' : motifTags.includes('Warm') ? 'Analog, detuned' : 'Digital, clean'}
- Filter movement: ${motifTags.includes('Expansive') ? 'Opening filter sweep' : motifTags.includes('Soft') ? 'Gentle low-pass' : 'Envelope-modulated'}
- Effects: ${motifTags.includes('Wide') ? 'Stereo chorus + delay' : motifTags.includes('Sparse') ? 'Minimal, dry signal' : 'Reverb + subtle delay'}
- Articulation: ${motifTags.includes('Heroic') || motifTags.includes('Anthemic') ? 'Sustained notes, full chords' : 'Single-note melodic line'}

## 💡 AI Generation Prompts

${prompts.map((p, i) => `${i + 1}. "${p}"`).join('\n\n')}

## 🔗 Production Context

- **Genre fit:** ${motifTags.includes('Heroic') || motifTags.includes('Anthemic') ? 'Trance, Progressive House, Epic' : motifTags.includes('Ethereal') ? 'Ambient, Chillwave, Downtempo' : 'Electronic, Synth-pop, Future Bass'}
- **Arrangement role:** ${motifTags.includes('Hooky') ? 'Main hook, chorus lead' : motifTags.includes('Soft') ? 'Background atmosphere' : 'Primary melodic element'}
- **Layering:** ${motifTags.includes('Sparse') ? 'Complement with harmonic pads' : 'Can stand alone or layer with harmonies'}
- **Emotional arc:** ${motifTags.includes('Longing') || motifTags.includes('Melancholic') ? 'Build tension, release in bridge' : motifTags.includes('Upward') || motifTags.includes('Bright') ? 'Uplift, energize listener' : 'Maintain emotional through-line'}
`;
}

/**
 * Formats a triplet selection for LLM consumption
 * @param {object} sel - Selected patterns {drum, bass, lead}
 * @param {number} tempo - Current tempo
 * @returns {string} Formatted markdown string
 */
export function formatTriplet(sel, tempo) {
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

/**
 * Formats the complete dataset for LLM consumption
 * @param {object} all - All patterns {drums, basses, leads}
 * @returns {string} Formatted markdown string
 */
export function formatAllForLLM(all) {
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

/**
 * Downloads an object as a JSON file
 * @param {object} obj - Object to download
 * @param {string} filename - Filename for download
 */
export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Escapes HTML special characters
 * @param {string} s - String to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(s) {
  return (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}
