/**
 * Audio Engine Component
 * Handles all Tone.js audio synthesis and playback
 */

/**
 * Creates and configures all audio synthesizers
 * @returns {object} Audio synths and transport controls
 */
export function createAudioEngine() {
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

  return { kick, snare, hihat, bass, lead };
}

/**
 * Parses chord progression to root notes
 * @param {string} prog - Chord progression string
 * @returns {array} Array of root notes
 */
export function parseChordRoot(prog) {
  const chordMap = {
    'C': 'C2', 'Cm': 'C2', 'D': 'D2', 'Dm': 'D2', 'E': 'E2', 'Em': 'E2',
    'F': 'F2', 'Fm': 'F2', 'G': 'G2', 'Gm': 'G2', 'A': 'A2', 'Am': 'A2',
    'B': 'B2', 'Bm': 'B2', 'Bb': 'A#2', 'Bbm': 'A#2', 'Ab': 'G#2',
    'Eb': 'D#2', 'Ebm': 'D#2', 'Db': 'C#2', 'Gb': 'F#2'
  };
  const chords = prog.split('-').map(c => c.trim());
  return chords.map(chord => chordMap[chord] || 'C2');
}

/**
 * Converts motif degrees to actual notes
 * @param {string} motif - Motif string (e.g., "1-3-5-7")
 * @param {string} key - Musical key/scale
 * @returns {array} Array of note names
 */
export function parseMotifToNotes(motif, key) {
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

/**
 * Creates audio sequences for playback
 * @param {object} selected - Selected patterns {drum, bass, lead}
 * @param {object} synths - Audio synth objects
 * @returns {object} Sequence objects {drumSeq, bassSeq, leadSeq}
 */
export function createSequences(selected, synths) {
  let drumSequence = null;
  let bassSequence = null;
  let leadSequence = null;

  // Setup drum sequence
  if (selected.drum && selected.drum.pattern) {
    const pattern = selected.drum.pattern;
    drumSequence = new Tone.Sequence((time, step) => {
      const char = pattern[step];
      if (char === 'X') {
        // Alternate between kick, snare, and hihat for variety
        if (step % 4 === 0) synths.kick.triggerAttackRelease('C1', '8n', time);
        else if (step % 4 === 2) synths.snare.triggerAttackRelease('16n', time);
        else synths.hihat.triggerAttackRelease('32n', time);
      }
    }, [...Array(32).keys()], '16n');
    drumSequence.start(0);
  }

  // Setup bass sequence
  if (selected.bass && selected.bass.prog) {
    const chordRoot = parseChordRoot(selected.bass.prog);
    bassSequence = new Tone.Sequence((time, note) => {
      synths.bass.triggerAttackRelease(note, '4n', time);
    }, chordRoot, '2n');
    bassSequence.start(0);
  }

  // Setup lead sequence
  if (selected.lead && selected.lead.motif) {
    const notes = parseMotifToNotes(selected.lead.motif, selected.lead.key);
    leadSequence = new Tone.Sequence((time, note) => {
      if (note) synths.lead.triggerAttackRelease(note, '8n', time);
    }, notes, '8n');
    leadSequence.start(0);
  }

  return { drumSequence, bassSequence, leadSequence };
}

/**
 * Stops and disposes of all sequences
 * @param {object} sequences - Sequence objects to stop
 */
export function stopSequences(sequences) {
  if (sequences.drumSequence) {
    sequences.drumSequence.stop();
    sequences.drumSequence.dispose();
  }
  if (sequences.bassSequence) {
    sequences.bassSequence.stop();
    sequences.bassSequence.dispose();
  }
  if (sequences.leadSequence) {
    sequences.leadSequence.stop();
    sequences.leadSequence.dispose();
  }
}
