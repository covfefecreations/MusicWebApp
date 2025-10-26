/**
 * Motif Tagging and Pattern Analysis Utilities
 * Extracts semantic tags from moods and analyzes pattern compatibility
 */

/**
 * Extracts individual motif tags from mood string
 * @param {string} mood - Mood string (e.g., "Tense • Cinematic")
 * @returns {array} Array of motif tags
 */
export function extractMotifTags(mood) {
  if (!mood) return [];
  return mood.split('•').map(tag => tag.trim()).filter(Boolean);
}

/**
 * Maps mood tags to semantic categories
 * @param {array} tags - Array of motif tags
 * @returns {object} Categorized tags
 */
export function categorizeMotifs(tags) {
  const categories = {
    energy: [],
    emotion: [],
    texture: [],
    movement: [],
    atmosphere: []
  };

  const mappings = {
    energy: ['Bright', 'Urgent', 'Driving', 'Relentless', 'Hypnotic', 'Punchy'],
    emotion: ['Tense', 'Hopeful', 'Nostalgic', 'Dark', 'Melancholic', 'Mournful', 'Longing', 'Heroic', 'Dreamy'],
    texture: ['Cinematic', 'Crisp', 'Warm', 'Shimmery', 'Clean', 'Sparse', 'Ethereal', 'Lush', 'Iridescent'],
    movement: ['Stuttering', 'Propulsive', 'Off-kilter', 'Nervous', 'Tight', 'Groovy', 'Funky'],
    atmosphere: ['Airy', 'Brooding', 'Wide', 'Open', 'Deep', 'Distant', 'Mysterious', 'Expansive', 'Soft', 'Sharp', 'Upward', 'Anthemic', 'Laidback', 'Hooky', 'Aggressive']
  };

  tags.forEach(tag => {
    for (const [category, keywords] of Object.entries(mappings)) {
      if (keywords.includes(tag)) {
        categories[category].push(tag);
      }
    }
  });

  return categories;
}

/**
 * Finds compatible patterns based on key signature
 * @param {string} key - Musical key
 * @param {array} allPatterns - All available patterns
 * @returns {array} Compatible pattern IDs
 */
export function findCompatibleByKey(key, allPatterns) {
  if (!key) return [];

  // Extract root and quality
  const keyLower = key.toLowerCase();
  const isMajor = keyLower.includes('major');
  const isMinor = keyLower.includes('minor');
  const isPentatonic = keyLower.includes('pentatonic');
  const isModal = keyLower.includes('lydian') || keyLower.includes('phrygian') || keyLower.includes('dorian');

  const compatibleKeys = [];

  allPatterns.forEach(pattern => {
    if (!pattern.key) return;
    const patternKey = pattern.key.toLowerCase();

    // Same key is always compatible
    if (patternKey === keyLower) {
      compatibleKeys.push(pattern.id);
      return;
    }

    // Major/minor compatibility
    if (isMajor && patternKey.includes('major')) {
      compatibleKeys.push(pattern.id);
    } else if (isMinor && patternKey.includes('minor')) {
      compatibleKeys.push(pattern.id);
    } else if (isPentatonic && patternKey.includes('pentatonic')) {
      compatibleKeys.push(pattern.id);
    }
  });

  return compatibleKeys;
}

/**
 * Finds compatible patterns based on BPM range
 * @param {number} bpm - Target BPM
 * @param {array} allPatterns - All available patterns
 * @param {number} tolerance - BPM tolerance (default: 10)
 * @returns {array} Compatible pattern IDs
 */
export function findCompatibleByBPM(bpm, allPatterns, tolerance = 10) {
  if (!bpm) return [];

  return allPatterns
    .filter(pattern => {
      if (!pattern.bpm) return false;
      return Math.abs(pattern.bpm - bpm) <= tolerance;
    })
    .map(p => p.id);
}

/**
 * Finds compatible patterns based on mood similarity
 * @param {string} mood - Target mood
 * @param {array} allPatterns - All available patterns
 * @returns {array} Compatible pattern IDs with similarity score
 */
export function findCompatibleByMood(mood, allPatterns) {
  if (!mood) return [];

  const targetTags = extractMotifTags(mood);
  const results = [];

  allPatterns.forEach(pattern => {
    if (!pattern.mood) return;

    const patternTags = extractMotifTags(pattern.mood);
    const commonTags = targetTags.filter(tag => patternTags.includes(tag));

    if (commonTags.length > 0) {
      results.push({
        id: pattern.id,
        similarity: commonTags.length / targetTags.length,
        commonMotifs: commonTags
      });
    }
  });

  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Generates AI-friendly prompt templates for pattern generation
 * @param {object} pattern - Pattern object
 * @param {string} type - Pattern type
 * @returns {array} Array of prompt templates
 */
export function generatePromptTemplates(pattern, type) {
  const tags = extractMotifTags(pattern.mood || '');
  const prompts = [];

  if (type === 'drum') {
    prompts.push(
      `Create a ${pattern.bpm} BPM drum pattern with a ${tags.join(' and ')} character, similar to "${pattern.title}". The pattern should be 2 bars (32 steps) with emphasis on ${tags[0]?.toLowerCase() || 'rhythmic'} elements.`,
      `Generate a variation of this drum loop: "${pattern.pattern}". Keep the ${tags[0]?.toLowerCase() || 'original'} feel but add more complexity.`,
      `Design a complementary drum pattern that would layer well with "${pattern.title}". Match the ${pattern.bpm} BPM tempo and ${tags.join(', ')} mood.`
    );
  } else if (type === 'bass') {
    prompts.push(
      `Create a bassline in ${pattern.key} with a ${tags.join(' and ')} quality. Use the progression ${pattern.prog} as inspiration.`,
      `Generate a ${tags[0]?.toLowerCase() || 'melodic'} bass pattern that complements the chord progression: ${pattern.prog}`,
      `Design a sub-bass layer for "${pattern.title}" that enhances its ${tags.join(' and ')} character.`
    );
  } else if (type === 'lead') {
    prompts.push(
      `Create a lead melody in ${pattern.key} using the motif ${pattern.motif} as a starting point. The character should be ${tags.join(' and ')}.`,
      `Generate a ${tags[0]?.toLowerCase() || 'melodic'} lead hook that develops from this scale degree pattern: ${pattern.motif}`,
      `Design a counter-melody to "${pattern.title}" that maintains the ${tags.join(' and ')} atmosphere.`
    );
  }

  return prompts;
}

/**
 * Analyzes pattern density/complexity
 * @param {string} pattern - Pattern string (for drums)
 * @returns {object} Density analysis
 */
export function analyzePatternDensity(pattern) {
  if (!pattern) return { density: 0, hits: 0, rests: 0, complexity: 'unknown' };

  const hits = (pattern.match(/X/g) || []).length;
  const rests = (pattern.match(/-/g) || []).length;
  const total = hits + rests;
  const density = hits / total;

  let complexity = 'medium';
  if (density < 0.25) complexity = 'sparse';
  else if (density < 0.4) complexity = 'moderate';
  else if (density < 0.6) complexity = 'medium';
  else if (density < 0.75) complexity = 'dense';
  else complexity = 'very dense';

  return {
    density: Math.round(density * 100) / 100,
    hits,
    rests,
    total,
    complexity,
    percentage: Math.round(density * 100)
  };
}
