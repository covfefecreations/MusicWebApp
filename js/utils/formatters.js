/**
 * Export and Formatting Utilities
 * Functions for formatting patterns for LLM consumption and JSON export
 */

/**
 * Formats a single pattern for LLM consumption
 * @param {object} item - Pattern object
 * @param {string} type - Pattern type (drum, bass, lead)
 * @returns {string} Formatted markdown string
 */
export function formatForLLM(item, type) {
  if (type === 'drum') {
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
  if (type === 'bass') {
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
