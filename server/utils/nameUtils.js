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

// ✅ ADD THIS FUNCTION to server/utils/nameUtils.js

/* -------------------------------------------------------------------------- */
/* 🆕 NEW: Get generation from Pokémon name */
/* -------------------------------------------------------------------------- */
export function getGenerationFromName(pokemonName) {
  if (!pokemonName || typeof pokemonName !== 'string') {
    console.warn('⚠️ getGenerationFromName: Invalid Pokémon name provided');
    return 1; // Default to Gen 1
  }

  const name = pokemonName.toLowerCase().trim();
  
  // Generation mapping based on Pokémon ID ranges or known patterns
  // This is a simplified version - you might want to enhance this with actual ID ranges
  
  // Gen 1 (IDs 1-151)
  const gen1Pokemon = [
    'bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard',
    'squirtle', 'wartortle', 'blastoise', 'caterpie', 'metapod', 'butterfree',
    'weedle', 'kakuna', 'beedrill', 'pidgey', 'pidgeotto', 'pidgeot', 'rattata',
    'raticate', 'spearow', 'fearow', 'ekans', 'arbok', 'pikachu', 'raichu',
    'sandshrew', 'sandslash', 'nidoran-f', 'nidorina', 'nidoqueen', 'nidoran-m',
    'nidorino', 'nidoking', 'clefairy', 'clefable', 'vulpix', 'ninetales',
    'jigglypuff', 'wigglytuff', 'zubat', 'golbat', 'oddish', 'gloom', 'vileplume',
    'paras', 'parasect', 'venonat', 'venomoth', 'diglett', 'dugtrio', 'meowth',
    'persian', 'psyduck', 'golduck', 'mankey', 'primeape', 'growlithe', 'arcanine',
    'poliwag', 'poliwhirl', 'poliwrath', 'abra', 'kadabra', 'alakazam', 'machop',
    'machoke', 'machamp', 'bellsprout', 'weepinbell', 'victreebel', 'tentacool',
    'tentacruel', 'geodude', 'graveler', 'golem', 'ponyta', 'rapidash', 'slowpoke',
    'slowbro', 'magnemite', 'magneton', 'farfetchd', 'doduo', 'dodrio', 'seel',
    'dewgong', 'grimer', 'muk', 'shellder', 'cloyster', 'gastly', 'haunter', 'gengar',
    'onix', 'drowzee', 'hypno', 'krabby', 'kingler', 'voltorb', 'electrode', 'exeggcute',
    'exeggutor', 'cubone', 'marowak', 'hitmonlee', 'hitmonchan', 'lickitung', 'koffing',
    'weezing', 'rhyhorn', 'rhydon', 'chansey', 'tangela', 'kangaskhan', 'horsea',
    'seadra', 'goldeen', 'seaking', 'staryu', 'starmie', 'mr-mime', 'scyther',
    'jynx', 'electabuzz', 'magmar', 'pinsir', 'tauros', 'magikarp', 'gyarados',
    'lapras', 'ditto', 'eevee', 'vaporeon', 'jolteon', 'flareon', 'porygon',
    'omanyte', 'omastar', 'kabuto', 'kabutops', 'aerodactyl', 'snorlax',
    'articuno', 'zapdos', 'moltres', 'dratini', 'dragonair', 'dragonite',
    'mewtwo', 'mew'
  ];

  // Gen 2 (IDs 152-251)
  const gen2Pokemon = [
    'chikorita', 'bayleef', 'meganium', 'cyndaquil', 'quilava', 'typhlosion',
    'totodile', 'croconaw', 'feraligatr', 'sentret', 'furret', 'hoothoot',
    'noctowl', 'ledyba', 'ledian', 'spinarak', 'ariados', 'crobat', 'chinchou',
    'lanturn', 'pichu', 'cleffa', 'igglybuff', 'togepi', 'togetic', 'natu',
    'xatu', 'mareep', 'flaaffy', 'ampharos', 'bellossom', 'marill', 'azumarill',
    'sudowoodo', 'politoed', 'hoppip', 'skiploom', 'jumpluff', 'aipom', 'sunkern',
    'sunflora', 'yanma', 'wooper', 'quagsire', 'espeon', 'umbreon', 'murkrow',
    'slowking', 'misdreavus', 'unown', 'wobbuffet', 'girafarig', 'pineco',
    'forretress', 'dunsparce', 'gligar', 'steelix', 'snubbull', 'granbull',
    'qwilfish', 'scizor', 'shuckle', 'heracross', 'sneasel', 'teddiursa',
    'ursaring', 'slugma', 'magcargo', 'swinub', 'piloswine', 'corsola',
    'remoraid', 'octillery', 'delibird', 'mantine', 'skarmory', 'houndour',
    'houndoom', 'kingdra', 'phanpy', 'donphan', 'porygon2', 'stantler',
    'smeargle', 'tyrogue', 'hitmontop', 'smoochum', 'elekid', 'magby',
    'miltank', 'blissey', 'raikou', 'entei', 'suicune', 'larvitar',
    'pupitar', 'tyranitar', 'lugia', 'ho-oh', 'celebi'
  ];

  // Check generations (you can expand this for more generations)
  if (gen1Pokemon.includes(name)) return 1;
  if (gen2Pokemon.includes(name)) return 2;
  
  // For forms/variants, check the base name
  const baseName = name.split('-')[0];
  if (gen1Pokemon.includes(baseName)) return 1;
  if (gen2Pokemon.includes(baseName)) return 2;

  // Default fallback - you might want to expand this with more generations
  console.log(`🔍 Using default generation for ${name}, consider expanding generation mapping`);
  return 1; // Default to Gen 1
}

export function getRegionFromGeneration(generation) {
  const regionMap = {
    1: 'kanto',
    2: 'johto', 
    3: 'hoenn',
    4: 'sinnoh',
    5: 'unova',
    6: 'kalos',
    7: 'alola',
    8: 'galar',
    9: 'paldea'
  };
  
  return regionMap[generation] || 'unknown';
}
