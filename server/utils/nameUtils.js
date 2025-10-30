// ✅ server/utils/nameUtils.js (FINAL VERSION)
/**
 * Convert PokéAPI names to PokémonDB sprite names using patterns
 */
export function normalizeVariantName(name) {
  if (!name || typeof name !== 'string') return '';

  return name
    .toLowerCase()
    .trim()
    .replace(/'/g, "")
    .replace(/[.:♀♂]/g, "") 
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generalized converter from PokéAPI to PokémonDB sprite names
 */
export function getPokemonDBSpriteName(pokeAPIName) {
  const normalized = normalizeVariantName(pokeAPIName);
  
  // Special cases that don't follow patterns (exceptions)
  const specialCases = {
    // Paldean forms with specific names
    'tauros-paldea': 'tauros-paldean-combat',
    'tauros-paldea-aqua': 'tauros-paldean-aqua',
    'tauros-paldea-blaze': 'tauros-paldean-blaze',
    'wooper-paldea': 'wooper-paldean',
    
    // Ogerpon forms
    'ogerpon': 'ogerpon',
    'ogerpon-wellspring': 'ogerpon-wellspring-mask',
    'ogerpon-hearthflame': 'ogerpon-hearthflame-mask', 
    'ogerpon-cornerstone': 'ogerpon-cornerstone-mask',
    
    // Minior forms
    'minior': 'minior-red-meteor',
    'minior-red': 'minior-red-meteor',
    'minior-orange': 'minior-orange-meteor',
    'minior-yellow': 'minior-yellow-meteor',
    'minior-green': 'minior-green-meteor',
    'minior-blue': 'minior-blue-meteor',
    'minior-indigo': 'minior-indigo-meteor',
    'minior-violet': 'minior-violet-meteor',
    'minior-red-core': 'minior-red',
    'minior-orange-core': 'minior-orange',
    'minior-yellow-core': 'minior-yellow',
    'minior-green-core': 'minior-green',
    'minior-blue-core': 'minior-blue',
    'minior-indigo-core': 'minior-indigo',
    'minior-violet-core': 'minior-violet',
    
    // Other exceptions that don't follow patterns
    'mime-jr': 'mime-jr',
    'ho-oh': 'ho-oh',
    'porygon-z': 'porygon-z',
    'jangmo-o': 'jangmo-o',
    'hakamo-o': 'hakamo-o',
    'kommo-o': 'kommo-o',
    'type-null': 'type-null',
    'great-tusk': 'great-tusk',
    'scream-tail': 'scream-tail',
    'brute-bonnet': 'brute-bonnet',
    'flutter-mane': 'flutter-mane',
    'slither-wing': 'slither-wing',
    'sandy-shocks': 'sandy-shocks',
    'iron-treads': 'iron-treads',
    'iron-bundle': 'iron-bundle',
    'iron-hands': 'iron-hands',
    'iron-jugulis': 'iron-jugulis',
    'iron-moth': 'iron-moth',
    'iron-thorns': 'iron-thorns',
    'roaring-moon': 'roaring-moon',
    'iron-valiant': 'iron-valiant',
    'walking-wake': 'walking-wake',
    'iron-leaves': 'iron-leaves'
  };
  
  // Check special cases first
  if (specialCases[normalized]) {
    return specialCases[normalized];
  }
  
  // Generalized pattern-based conversions
  let spriteName = normalized;
  
  // Pattern 1: Regional forms - add 'n' to region name
  const regionalPatterns = [
    { from: /-alola$/, to: '-alolan' },
    { from: /-galar$/, to: '-galarian' },
    { from: /-hisui$/, to: '-hisuian' },
    { from: /-paldea$/, to: '-paldean' },
    { from: /-kant(o)?$/, to: '-kanto' } // Handle Kantonian forms if they exist
  ];
  
  for (const pattern of regionalPatterns) {
    if (pattern.from.test(spriteName)) {
      spriteName = spriteName.replace(pattern.from, pattern.to);
      break;
    }
  }
  
  // Pattern 2: Gigantamax forms - expand abbreviation
  if (spriteName.endsWith('-gmax')) {
    spriteName = spriteName.replace('-gmax', '-gigantamax');
  }
  
  // Pattern 3: Remove "standard" from forms (if present)
  if (spriteName.includes('-standard')) {
    spriteName = spriteName.replace('-standard', '');
  }
  
  // Pattern 4: Handle "male/female" forms (if needed)
  if (spriteName.endsWith('-male')) {
    spriteName = spriteName.replace('-male', '');
  }
  if (spriteName.endsWith('-female')) {
    spriteName = spriteName.replace('-female', '');
  }
  
  return spriteName;
}

/**
 * Get PokémonDB sprite URL
 */
export function getPokemonSpriteUrl(pokeAPIName) {
  const spriteName = getPokemonDBSpriteName(pokeAPIName);
  return `https://img.pokemondb.net/sprites/home/normal/${spriteName}.png`;
}

/**
 * Get base name without variants (for evolution chain lookup)
 */
export function getBaseName(name) {
  const normalized = normalizeVariantName(name);
  
  // Remove common variant suffixes
  return normalized
    .replace(/-mega(-x|-y)?$/, "")
    .replace(/-gmax$/, "")
    .replace(/-alola$/, "")
    .replace(/-galar$/, "")
    .replace(/-hisui$/, "")
    .replace(/-paldea$/, "")
    .replace(/-primal$/, "")
    .replace(/-(plant|sandy|trash|land|sky|standard|zen|incarnate|therian|ordinary|resolute|aria|pirouette|male|female|shield|blade|average|small|large|super|baile|pompom|pau|sensu|midday|midnight|dusk|solo|school|red|orange|yellow|green|blue|indigo|violet|disguised|busted|amped|lowkey|noice|fullbelly|hangry)$/, "");
}

/**
 * Check if a Pokémon name needs special handling
 */
export function needsSpecialHandling(name) {
  const specialPatterns = [
    /tauros-?paldea/,
    /ogerpon/,
    /minior/,
    /type-?null/,
    /iron-/,
    /great-?tusk/,
    /scream-?tail/,
    /brute-?bonnet/,
    /flutter-?mane/,
    /slither-?wing/,
    /sandy-?shocks/,
    /roaring-?moon/,
    /walking-?wake/,
    /iron-?leaves/
  ];
  
  return specialPatterns.some(pattern => pattern.test(name.toLowerCase()));
}

// 🧪 Test function (development only)
export function testNameNormalization() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const testCases = [
    { input: 'raichu-alola', expected: 'raichu-alolan' },
    { input: 'charizard-gmax', expected: 'charizard-gigantamax' },
    { input: 'tauros-paldea', expected: 'tauros-paldean-combat' },
    { input: 'minior-red', expected: 'minior-red-meteor' },
    { input: 'pikachu', expected: 'pikachu' },
    { input: 'charizard-mega-x', expected: 'charizard-mega-x' }
  ];
  
  console.log('🧪 Testing name normalization:');
  testCases.forEach(test => {
    const result = getPokemonDBSpriteName(test.input);
    const status = result === test.expected ? '✅' : '❌';
    console.log(`  ${status} ${test.input} → ${result} (expected: ${test.expected})`);
  });
}