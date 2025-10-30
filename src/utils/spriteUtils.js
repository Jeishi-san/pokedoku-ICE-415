// ✅ Frontend sprite utility (CORRECTED - matches PokémonDB exactly)

/**
 * Convert PokéAPI names to PokémonDB sprite names using patterns
 */
function normalizeVariantName(name) {
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
 * CORRECTED converter from API names to PokémonDB sprite names
 * MATCHES EXACTLY what PokémonDB uses in their URLs
 */
export function getPokemonDBSpriteName(pokeAPIName) {
  const normalized = normalizeVariantName(pokeAPIName);
  
  // Special cases that match PokémonDB EXACTLY
  const specialCases = {
    // ===== OGERPON FORMS =====
    'ogerpon-wellspring-mask': 'ogerpon-wellspring',
    'ogerpon-hearthflame-mask': 'ogerpon-hearthflame', 
    'ogerpon-cornerstone-mask': 'ogerpon-cornerstone',
    'ogerpon-wellspring': 'ogerpon-wellspring',
    'ogerpon-hearthflame': 'ogerpon-hearthflame',
    'ogerpon-cornerstone': 'ogerpon-cornerstone',
    'ogerpon': 'ogerpon',

    // ===== MINIOR FORMS =====
    'minior-red-meteor': 'minior-meteor',
    'minior-orange-meteor': 'minior-meteor',
    'minior-yellow-meteor': 'minior-meteor',
    'minior-green-meteor': 'minior-meteor',
    'minior-blue-meteor': 'minior-meteor',
    'minior-indigo-meteor': 'minior-meteor',
    'minior-violet-meteor': 'minior-meteor',
    'minior-red': 'minior-meteor',
    'minior-orange': 'minior-meteor',
    'minior-yellow': 'minior-meteor',
    'minior-green': 'minior-meteor',
    'minior-blue': 'minior-meteor',
    'minior-indigo': 'minior-meteor',
    'minior-violet': 'minior-meteor',
    'minior': 'minior-meteor',
    'minior-red-core': 'minior-red-core',
    'minior-orange-core': 'minior-orange-core',
    'minior-yellow-core': 'minior-yellow-core',
    'minior-green-core': 'minior-green-core',
    'minior-blue-core': 'minior-blue-core',
    'minior-indigo-core': 'minior-indigo-core',
    'minior-violet-core': 'minior-violet-core',

    // ===== PALDEAN TAUROS FORMS =====
    'tauros-paldea-combat-breed': 'tauros-paldean-combat',
    'tauros-paldea-aqua-breed': 'tauros-paldean-aqua',
    'tauros-paldea-blaze-breed': 'tauros-paldean-blaze',
    'tauros-paldea-combat': 'tauros-paldean-combat',
    'tauros-paldea-aqua': 'tauros-paldean-aqua',
    'tauros-paldea-blaze': 'tauros-paldean-blaze',
    'tauros-paldea': 'tauros-paldean-combat',
    'wooper-paldea': 'wooper-paldean',
    'wooper-paldea-breed': 'wooper-paldean',

    // ===== OTHER FORMS =====
    'necrozma-dusk': 'necrozma-dusk-mane',
    'necrozma-dawn': 'necrozma-dawn-wings',
    'necrozma-ultra': 'necrozma-ultra',
    'kyurem-black': 'kyurem-black',
    'kyurem-white': 'kyurem-white',
    'kyogre-primal': 'kyogre-primal',
    'groudon-primal': 'groudon-primal',
    'deoxys-attack': 'deoxys-attack',
    'deoxys-defense': 'deoxys-defense',
    'deoxys-speed': 'deoxys-speed',
    'giratina-origin': 'giratina-origin',
    'thundurus-therian': 'thundurus-therian',
    'tornadus-therian': 'tornadus-therian',
    'landorus-therian': 'landorus-therian',

    // ===== PARADOX POKÉMON =====
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
    'iron-leaves': 'iron-leaves',

    // ===== SPECIAL CHARACTERS =====
    'mime-jr': 'mime-jr',
    'ho-oh': 'ho-oh',
    'porygon-z': 'porygon-z',
    'jangmo-o': 'jangmo-o',
    'hakamo-o': 'hakamo-o',
    'kommo-o': 'kommo-o',
    'type-null': 'type-null',
    'farfetchd': 'farfetchd',
    'sirfetchd': 'sirfetchd',
    'mr-mime': 'mr-mime',
    'mr-rime': 'mr-rime',
    'nidoran-f': 'nidoran-f',
    'nidoran-m': 'nidoran-m',

    // ===== REGULAR POKÉMON =====
    'pikachu': 'pikachu',
    'charizard': 'charizard',
    'bulbasaur': 'bulbasaur',
    'squirtle': 'squirtle',
    'charmander': 'charmander',
    'eevee': 'eevee',
    'lucario': 'lucario',
    'gengar': 'gengar',
    'mewtwo': 'mewtwo',
    'mew': 'mew'
  };
  
  // Check special cases first
  if (specialCases[normalized]) {
    return specialCases[normalized];
  }
  
  // Generalized pattern-based conversions
  let spriteName = normalized;
  
  // Pattern 1: Remove API-specific suffixes first
  const apiSuffixes = ['-breed', '-mask'];
  apiSuffixes.forEach(suffix => {
    if (spriteName.endsWith(suffix)) {
      spriteName = spriteName.replace(suffix, '');
    }
  });

  // Pattern 2: Regional forms - add 'n' to region name
  const regionalPatterns = [
    { from: /-alola$/, to: '-alolan' },
    { from: /-galar$/, to: '-galarian' },
    { from: /-hisui$/, to: '-hisuian' },
    { from: /-paldea$/, to: '-paldean' }
  ];
  
  for (const pattern of regionalPatterns) {
    if (pattern.from.test(spriteName)) {
      spriteName = spriteName.replace(pattern.from, pattern.to);
      break;
    }
  }
  
  // Pattern 3: Gigantamax forms - expand abbreviation
  if (spriteName.endsWith('-gmax')) {
    spriteName = spriteName.replace('-gmax', '-gigantamax');
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
 * Enhanced sprite URL with fallback checking
 */
export async function getPokemonSpriteUrlWithFallback(pokemonName) {
  const primaryUrl = getPokemonSpriteUrl(pokemonName);
  
  if (import.meta.env.PROD) {
    return primaryUrl;
  }
  
  try {
    const response = await fetch(primaryUrl, { method: 'HEAD' });
    if (response.ok) {
      return primaryUrl;
    }
  } catch (error) {
    console.warn(`Failed to check sprite for ${pokemonName}:`, error);
  }
  
  const baseName = getBaseName(pokemonName);
  if (baseName && baseName !== pokemonName.toLowerCase()) {
    const fallbackUrl = getPokemonSpriteUrl(baseName);
    try {
      const response = await fetch(fallbackUrl, { method: 'HEAD' });
      if (response.ok) {
        return fallbackUrl;
      }
    } catch (error) {
      // Continue to final fallback
    }
  }
  
  return getFallbackSpriteUrl();
}

/**
 * Get base name without variants
 */
export function getBaseName(name) {
  const normalized = normalizeVariantName(name);
  
  return normalized
    .replace(/-mega(-x|-y)?$/, "")
    .replace(/-gmax$/, "")
    .replace(/-alola$/, "")
    .replace(/-galar$/, "")
    .replace(/-hisui$/, "")
    .replace(/-paldea$/, "")
    .replace(/-primal$/, "")
    .replace(/-eternamax$/, "")
    .replace(/-ash$/, "")
    .replace(/-totem$/, "")
    .replace(/-(plant|sandy|trash|land|sky|standard|zen|incarnate|therian|ordinary|resolute|aria|pirouette|male|female|shield|blade|average|small|large|super|baile|pompom|pau|sensu|midday|midnight|dusk|solo|school|red|orange|yellow|green|blue|indigo|violet|disguised|busted|amped|lowkey|noice|fullbelly|hangry|combat|aqua|blaze)$/, "")
    .replace(/-(ice|shadow)-rider$/, "")
    .replace(/-core$/, "")
    .replace(/-mask$/, "")
    .replace(/-dusk$/, "")
    .replace(/-dawn$/, "")
    .replace(/-ultra$/, "")
    .replace(/-black$/, "")
    .replace(/-white$/, "")
    .replace(/-attack$/, "")
    .replace(/-defense$/, "")
    .replace(/-speed$/, "")
    .replace(/-origin$/, "")
    .replace(/-breed$/, "");
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
    /iron-?leaves/,
    /^farfetchd/,
    /^mr-/,
    /^nidoran/,
    /necrozma-/,
    /kyurem-/,
    /deoxys-/,
    /giratina-/,
    /calyrex-/,
    /terapagos-/
  ];
  
  return specialPatterns.some(pattern => pattern.test(name.toLowerCase()));
}

// Fallback for missing sprites
export function getFallbackSpriteUrl() {
  return 'https://img.pokemondb.net/sprites/home/normal/missingno.png';
}

// Utility to preload sprites
export function preloadPokemonSprites(pokemonNames) {
  if (!Array.isArray(pokemonNames)) return;
  
  pokemonNames.forEach(name => {
    const img = new Image();
    img.src = getPokemonSpriteUrl(name);
  });
}

// Make functions available globally for testing in development
if (import.meta.env.DEV) {
  window.getPokemonDBSpriteName = getPokemonDBSpriteName;
  window.getPokemonSpriteUrl = getPokemonSpriteUrl;
  
  // Add a test function for the problematic sprites
  window.testProblematicSprites = function() {
    console.group('🔧 Testing Problematic Sprites');
    
    const testCases = [
      { input: 'ogerpon-cornerstone-mask', expected: 'ogerpon-cornerstone' },
      { input: 'ogerpon-hearthflame-mask', expected: 'ogerpon-hearthflame' },
      { input: 'ogerpon-wellspring-mask', expected: 'ogerpon-wellspring' },
      { input: 'minior-indigo-meteor', expected: 'minior-meteor' },
      { input: 'minior-blue-core', expected: 'minior-blue-core' },
      { input: 'tauros-paldea-aqua-breed', expected: 'tauros-paldean-aqua' },
      { input: 'tauros-paldea-blaze-breed', expected: 'tauros-paldean-blaze' },
      { input: 'tauros-paldea-combat-breed', expected: 'tauros-paldean-combat' }
    ];
    
    testCases.forEach(test => {
      const result = getPokemonDBSpriteName(test.input);
      const url = getPokemonSpriteUrl(test.input);
      const status = result === test.expected ? '✅' : '❌';
      
      console.log(`${status} ${test.input}`);
      console.log(`   → Generated: ${result}`);
      console.log(`   → Expected:  ${test.expected}`);
      console.log(`   → URL: ${url}`);
      
      // Test if sprite loads
      const img = new Image();
      img.onload = () => console.log(`   📸 SPRITE LOADS`);
      img.onerror = () => console.error(`   ❌ SPRITE FAILED`);
      img.src = url;
    });
    
    console.groupEnd();
  };
}

// Export everything for consistency
export default {
  getPokemonSpriteUrl,
  getPokemonSpriteUrlWithFallback,
  getPokemonDBSpriteName,
  getBaseName,
  needsSpecialHandling,
  getFallbackSpriteUrl,
  preloadPokemonSprites
};