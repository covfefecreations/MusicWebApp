// data.js - prepopulated dataset (10 each)
export const drums = [
  { id: 'd1', title: 'Rising Steam', bpm: 172, mood: 'Tense • Cinematic', icon: 'rings',
    pattern: 'X---X---X---X---X---X---X---X---' },
  { id: 'd2', title: 'Trap Stutter', bpm: 165, mood: 'Stuttering • Dark', icon: 'waveform',
    pattern: 'X--X-X--X---X--X--X--X---X-X--' },
  { id: 'd3', title: 'Solar Pulse', bpm: 168, mood: 'Propulsive • Warm', icon: 'rings',
    pattern: 'X---X-X--X---X---X-X--X---X---' },
  { id: 'd4', title: 'Broken Clock', bpm: 170, mood: 'Off-kilter • Nervous', icon: 'compass',
    pattern: 'X--X--X-XX---X--X--XX--X--X--X-' },
  { id: 'd5', title: 'Neon Rush', bpm: 174, mood: 'Bright • Urgent', icon: 'waveform',
    pattern: 'X-X-X-X-XX-X-X-XX-X-X-X-X-XX-X-' },
  { id: 'd6', title: 'Underflow', bpm: 162, mood: 'Deep • Sparse', icon: 'rings',
    pattern: 'X-------X---X-------X---X-------' },
  { id: 'd7', title: 'Metro Snap', bpm: 170, mood: 'Tight • Driving', icon: 'rings',
    pattern: 'X--X--X-X--X--X-X--X--X-X--X--X-' },
  { id: 'd8', title: 'Glass Hat', bpm: 168, mood: 'Shimmery • Crisp', icon: 'heart',
    pattern: '-X-X-X-X-X-X-X-X-X-X-X-X-X-X-X-' },
  { id: 'd9', title: 'Pulse Engine', bpm: 176, mood: 'Relentless • Hypnotic', icon: 'waveform',
    pattern: 'X-X--X-X-X--X-X-X--X-X-X--X-X--' },
  { id: 'd10', title: 'Lazy Groove', bpm: 160, mood: 'Laidback • Warm', icon: 'heart',
    pattern: 'X---X---X-----X---X---X-----X---' }
];

export const basses = [
  { id:'b1', title:'Warm Circuit', key:'C major', prog:'C - Am - F - G', mood:'Hopeful • Nostalgic', icon:'heart' },
  { id:'b2', title:'Iron Root', key:'A minor', prog:'Am - F - C - G', mood:'Dark • Resolute', icon:'compass' },
  { id:'b3', title:'Glass Pulse', key:'E minor', prog:'Em - C - G - D', mood:'Airy • Driving', icon:'waveform' },
  { id:'b4', title:'Low Beacon', key:'D minor', prog:'Dm - Bb - F - C', mood:'Brooding • Wide', icon:'rings' },
  { id:'b5', title:'Sunny Motion', key:'G major', prog:'G - Em - C - D', mood:'Bright • Open', icon:'heart' },
  { id:'b6', title:'Syncopated Anchor', key:'F minor', prog:'Fm - Db - Ab - Eb', mood:'Funky • Punchy', icon:'compass' },
  { id:'b7', title:'Submarine', key:'C minor', prog:'Cm - Ab - Eb - Bb', mood:'Deep • Distant', icon:'rings' },
  { id:'b8', title:'Walking Line', key:'Bb major', prog:'Bb - Gm - Eb - F', mood:'Groovy • Warm', icon:'heart' },
  { id:'b9', title:'Prismatic', key:'A major', prog:'A - F#m - D - E', mood:'Urgent • Clean', icon:'waveform' },
  { id:'b10', title:'Hollow Root', key:'E flat minor', prog:'Ebm - Bbm - Ab - Gb', mood:'Mournful • Lush', icon:'compass' }
];

export const leads = [
  { id:'l1', title:'Neon Veins', key:'E minor pentatonic', motif:'1-3-5-7-5-3', mood:'Heroic • Bright', icon:'waveform' },
  { id:'l2', title:'Sigh Motif', key:'A minor', motif:'1-7-5-3-1', mood:'Melancholic • Soft', icon:'heart' },
  { id:'l3', title:'Bolt', key:'B Phrygian', motif:'1-♭2-3-1', mood:'Aggressive • Sharp', icon:'rings' },
  { id:'l4', title:'Halo', key:'C Lydian', motif:'1-2-3-5-4', mood:'Dreamy • Upward', icon:'rings' },
  { id:'l5', title:'Glass Lead', key:'D major', motif:'1-3-5-6-5-3', mood:'Clear • Anthemic', icon:'waveform' },
  { id:'l6', title:'Wisp', key:'F minor pentatonic', motif:'1-♭3-4-5', mood:'Ethereal • Sparse', icon:'heart' },
  { id:'l7', title:'Driver', key:'G minor', motif:'1-5-6-5-1', mood:'Punchy • Hooky', icon:'compass' },
  { id:'l8', title:'Orbit', key:'C minor', motif:'1-2-♭3-5', mood:'Mysterious • Expansive', icon:'rings' },
  { id:'l9', title:'Shard', key:'E major', motif:'1-2-3-#4-5', mood:'Iridescent • Tense', icon:'waveform' },
  { id:'l10', title:'Quiet Cry', key:'Bb minor', motif:'1-♭6-5-3', mood:'Longing • Soft', icon:'heart' }
];
