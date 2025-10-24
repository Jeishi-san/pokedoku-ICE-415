// src/utils/specialPokemon.js

// --- Hardcoded Lists ---

// Fossil Pokémon
export const FOSSIL_POKEMON = [
  "omanyte", "omastar",
  "kabuto", "kabutops",
  "aerodactyl",
  "lileep", "cradily",
  "anorith", "armaldo",
  "cranidos", "rampardos",
  "shieldon", "bastiodon",
  "tirtouga", "carracosta",
  "archen", "archeops",
  "tyrunt", "tyrantrum",
  "amaura", "aurorus",
  "dracozolt", "arctozolt",
  "dracovish", "arctovish",
];

// Ultra Beasts
export const ULTRA_BEASTS = [
  "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela",
  "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon"
];

// Paradox Pokémon
export const PARADOX_POKEMON = [
  // Scarlet Paradox
  "great tusk", "scream tail", "brute bonnet", "flutter mane",
  "slither wing", "sandy shocks", "roaring moon",
  // Violet Paradox
  "iron treads", "iron bundle", "iron hands", "iron jugulis",
  "iron moth", "iron thorns", "iron valiant",
];

// Starters (including full evolutionary lines)
export const STARTERS = [
  // Kanto
  "bulbasaur","ivysaur","venusaur",
  "charmander","charmeleon","charizard",
  "squirtle","wartortle","blastoise",
  // Johto
  "chikorita","bayleef","meganium",
  "cyndaquil","quilava","typhlosion",
  "totodile","croconaw","feraligatr",
  // Hoenn
  "treecko","grovyle","sceptile",
  "torchic","combusken","blaziken",
  "mudkip","marshtomp","swampert",
  // Sinnoh
  "turtwig","grotle","torterra",
  "chimchar","monferno","infernape",
  "piplup","prinplup","empoleon",
  // Unova
  "snivy","servine","serperior",
  "tepig","pignite","emboar",
  "oshawott","dewott","samurott",
  // Kalos
  "chespin","quilladin","chesnaught",
  "fennekin","braixen","delphox",
  "froakie","frogadier","greninja",
  // Alola
  "rowlet","dartrix","decidueye",
  "litten","torracat","incineroar",
  "popplio","brionne","primarina",
  // Galar
  "grookey","thwackey","rillaboom",
  "scorbunny","raboot","cinderace",
  "sobble","drizzile","inteleon",
  // Paldea
  "sprigatito","floragato","meowscarada",
  "fuecoco","crocalor","skeledirge",
  "quaxly","quaxwell","quaquaval",
];

// Baby Pokémon (pre-evolutions)
export const BABY_POKEMON = [
  "pichu", "cleffa", "igglybuff", "togepi", "tyrogue", "smoochum",
  "elekid", "magby", "azurill", "wynaut", "budew", "chingling",
  "bonsly", "mime jr", "happiny", "munchlax", "riolu", "mantyke", "toxel",
];

// --- Helper Functions ---

/**
 * Identify which special category (if any) a Pokémon belongs to.
 * @param {string} name - Pokémon name (lowercase recommended)
 * @returns {"fossil"|"ultra-beast"|"paradox"|"starter"|"baby"|null}
 */
export function getSpecialCategory(name = "") {
  const n = name.toLowerCase().trim();

  if (FOSSIL_POKEMON.includes(n)) return "fossil";
  if (ULTRA_BEASTS.includes(n)) return "ultra-beast";
  if (PARADOX_POKEMON.includes(n)) return "paradox";
  if (STARTERS.includes(n)) return "starter";
  if (BABY_POKEMON.includes(n)) return "baby";
  return null;
}

// ✅ Add named checkers for external use
export function checkFossil(name) {
  return FOSSIL_POKEMON.includes(name?.toLowerCase().trim());
}

export function checkUltraBeast(name) {
  return ULTRA_BEASTS.includes(name?.toLowerCase().trim());
}

export function checkParadox(name) {
  return PARADOX_POKEMON.includes(name?.toLowerCase().trim());
}

export function checkStarter(name) {
  return STARTERS.includes(name?.toLowerCase().trim());
}

export function checkBaby(name) {
  return BABY_POKEMON.includes(name?.toLowerCase().trim());
}
