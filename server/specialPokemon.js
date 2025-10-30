// src/utils/specialPokemon.js

/* -------------------------------------------------------------------------- */
/* 🦴 HARD-CODED SPECIAL GROUPS (EXTENDED FOR NEW REGIONS)                   */
/* -------------------------------------------------------------------------- */

// 🧱 Fossil Pokémon
export const FOSSIL_POKEMON = [
  "omanyte","omastar","kabuto","kabutops","aerodactyl",
  "lileep","cradily","anorith","armaldo","cranidos",
  "rampardos","shieldon","bastiodon","tirtouga","carracosta",
  "archen","archeops","tyrunt","tyrantrum","amaura",
  "aurorus","dracozolt","arctozolt","dracovish","arctovish"
];

// 🚀 Ultra Beasts
export const ULTRA_BEASTS = [
  "nihilego","buzzwole","pheromosa","xurkitree","celesteela",
  "kartana","guzzlord","poipole","naganadel","stakataka","blacephalon"
];

// ⚡ Paradox Pokémon (Scarlet & Violet)
export const PARADOX_POKEMON = [
  "great-tusk","scream-tail","brute-bonnet","flutter-mane","slither-wing",
  "sandy-shocks","roaring-moon","iron-treads","iron-bundle","iron-hands",
  "iron-jugulis","iron-moth","iron-thorns","iron-valiant","walking-wake",
  "iron-leaves","gouging-fire","raging-bolt","iron-boulder","iron-crown"
];

// 🌱 Starters (Including Regional Variants)
export const STARTERS = [
  // Kanto → Paldea
  "bulbasaur","ivysaur","venusaur","charmander","charmeleon","charizard",
  "squirtle","wartortle","blastoise","chikorita","bayleef","meganium",
  "cyndaquil","quilava","typhlosion","totodile","croconaw","feraligatr",
  "treecko","grovyle","sceptile","torchic","combusken","blaziken",
  "mudkip","marshtomp","swampert","turtwig","grotle","torterra",
  "chimchar","monferno","infernape","piplup","prinplup","empoleon",
  "snivy","servine","serperior","tepig","pignite","emboar",
  "oshawott","dewott","samurott","chespin","quilladin","chesnaught",
  "fennekin","braixen","delphox","froakie","frogadier","greninja",
  "rowlet","dartrix","decidueye","litten","torracat","incineroar",
  "popplio","brionne","primarina","grookey","thwackey","rillaboom",
  "scorbunny","raboot","cinderace","sobble","drizzile","inteleon",
  "sprigatito","floragato","meowscarada","fuecoco","crocalor","skeledirge",
  "quaxly","quaxwell","quaquaval",

  // Regional starters (Hisui forms with correct sprite names)
  "decidueye-hisui","typhlosion-hisui","samurott-hisui"
];

// 🍼 Baby Pokémon
export const BABY_POKEMON = [
  "pichu","cleffa","igglybuff","togepi","tyrogue","smoochum",
  "elekid","magby","azurill","wynaut","budew","chingling",
  "bonsly","mime-jr","happiny","munchlax","riolu","mantyke","toxel"
];

// 🎭 Special Forms that need sprite mapping consideration
export const SPECIAL_FORMS_SPRITE_MAPPING = {
  // Regional forms that have different sprite names
  "nidoran-f": "nidoran-f",
  "nidoran-m": "nidoran-m", 
  "farfetchd": "farfetchd",
  "farfetchd-galarian": "farfetchd-galarian",
  "sirfetchd": "sirfetchd",
  "mr-mime": "mr-mime",
  "mr-mime-galarian": "mr-mime-galarian",
  "mr-rime": "mr-rime",
  "mime-jr": "mime-jr",
  "type-null": "type-null",
  "ho-oh": "ho-oh",
  "jangmo-o": "jangmo-o",
  "hakamo-o": "hakamo-o",
  "kommo-o": "kommo-o",
  "tapu-koko": "tapu-koko",
  "tapu-lele": "tapu-lele",
  "tapu-bulu": "tapu-bulu",
  "tapu-fini": "tapu-fini",
  "great-tusk": "great-tusk",
  "scream-tail": "scream-tail",
  "brute-bonnet": "brute-bonnet",
  "flutter-mane": "flutter-mane",
  "slither-wing": "slither-wing",
  "sandy-shocks": "sandy-shocks",
  "iron-treads": "iron-treads",
  "iron-bundle": "iron-bundle",
  "iron-hands": "iron-hands",
  "iron-jugulis": "iron-jugulis",
  "iron-moth": "iron-moth",
  "iron-thorns": "iron-thorns",
  "iron-valiant": "iron-valiant",
  "walking-wake": "walking-wake",
  "iron-leaves": "iron-leaves",
  "gouging-fire": "gouging-fire",
  "raging-bolt": "raging-bolt",
  "iron-boulder": "iron-boulder",
  "iron-crown": "iron-crown",
  "roaring-moon": "roaring-moon",
  "naganadel": "naganadel"
};

/* -------------------------------------------------------------------------- */
/* 🗺️ GENERATION TO REGION MAPPING                                           */
/* -------------------------------------------------------------------------- */

const generationToRegion = {
  "1": "Kanto",
  "2": "Johto", 
  "3": "Hoenn",
  "4": "Sinnoh",
  "5": "Unova",
  "6": "Kalos",
  "7": "Alola",
  "8": "Galar",
  "9": "Paldea",
  "generation-i": "Kanto",
  "generation-ii": "Johto",
  "generation-iii": "Hoenn",
  "generation-iv": "Sinnoh",
  "generation-v": "Unova",
  "generation-vi": "Kalos",
  "generation-vii": "Alola",
  "generation-viii": "Galar",
  "generation-ix": "Paldea",
};

export const mapGenerationToRegion = (gen) => {
  if (!gen) return "Unknown";
  const key = typeof gen === "string" ? gen : gen?.name || gen?.id;
  return generationToRegion[key] || "Unknown";
};

/* -------------------------------------------------------------------------- */
/* 🏞️ REGION DETECTION FUNCTIONS                                             */
/* -------------------------------------------------------------------------- */

export function getPokemonRegion(name, generation) {
  if (!name) return "Unknown";
  const lower = normalizeName(name);
  const baseName = getBaseFormName(lower);

  // 🏝️ Regional forms
  if (/-alola/.test(lower)) return "Alola";
  if (/-galar/.test(lower)) return "Galar";
  if (/-hisui/.test(lower)) return "Hisui";
  if (/-paldea/.test(lower)) return "Paldea";

  // Fossils
  const fossilRegions = {
    omanyte: "Kanto", kabuto: "Kanto", aerodactyl: "Kanto",
    lileep: "Hoenn", anorith: "Hoenn",
    cranidos: "Sinnoh", shieldon: "Sinnoh",
    tirtouga: "Unova", archen: "Unova",
    tyrunt: "Kalos", amaura: "Kalos",
    dracozolt: "Galar", arctozolt: "Galar",
    dracovish: "Galar", arctovish: "Galar",
  };
  if (fossilRegions[baseName]) return fossilRegions[baseName];

  // Legendary/Mythical
  const legendaryRegions = {
    mewtwo: "Kanto", mew: "Kanto",
    lugia: "Johto", hooh: "Johto", celebi: "Johto",
    kyogre: "Hoenn", groudon: "Hoenn", rayquaza: "Hoenn",
    dialga: "Sinnoh", palkia: "Sinnoh", giratina: "Sinnoh", arceus: "Sinnoh",
    zekrom: "Unova", reshiram: "Unova", kyurem: "Unova",
    xerneas: "Kalos", yveltal: "Kalos", zygarde: "Kalos",
    solgaleo: "Alola", lunala: "Alola", necrozma: "Alola",
    zacian: "Galar", zamazenta: "Galar", eternatus: "Galar",
    koraidon: "Paldea", miraidon: "Paldea",
  };
  if (legendaryRegions[baseName]) return legendaryRegions[baseName];

  // Paradox Pokémon → Paldea
  if (PARADOX_POKEMON.includes(lower)) return "Paldea";

  // Ultra Beasts → Alola
  if (ULTRA_BEASTS.includes(lower)) return "Alola";

  // Special forms → recursively resolve base
  if (/-mega|primal/.test(lower) || /-gmax/.test(lower)) {
    return getPokemonRegion(baseName, generation);
  }

  // Fallback: generation mapping
  return mapGenerationToRegion(generation);
}

export function getSpecialFormRegion(name, generation) {
  const normalized = normalizeName(name);
  
  // Special cases for forms that have specific regions
  const specialRegionCases = {
    "lycanroc-dusk": "Alola",
    "lycanroc-midnight": "Alola", 
    "lycanroc-midday": "Alola",
    "wishiwashi-school": "Alola",
    "minior-meteor": "Alola",
    "minior-core": "Alola",
    "oricorio-baile": "Alola",
    "oricorio-pom-pom": "Alola",
    "oricorio-pau": "Alola",
    "oricorio-sensu": "Alola",
    "zygarde-10": "Kalos",
    "zygarde-50": "Kalos",
    "zygarde-complete": "Kalos",
  };
  
  return specialRegionCases[normalized] || getPokemonRegion(name, generation);
}

/* -------------------------------------------------------------------------- */
/* 🏷️ SPECIAL STATUS FUNCTIONS                                               */
/* -------------------------------------------------------------------------- */

export function getSpecialStatuses(name) {
  const normalized = normalizeName(name);
  const statuses = [];

  // Regional forms
  if (/-alola/.test(normalized)) statuses.push("alolan-form");
  if (/-galar/.test(normalized)) statuses.push("galarian-form");
  if (/-hisui/.test(normalized)) statuses.push("hisuian-form");
  if (/-paldea/.test(normalized)) statuses.push("paldean-form");
  
  // Special battle forms
  if (/-mega/.test(normalized)) statuses.push("mega-evolution");
  if (/-gmax/.test(normalized)) statuses.push("gigantamax");
  if (/-primal/.test(normalized)) statuses.push("primal-reversion");
  
  // Size forms
  if (/-totem/.test(normalized)) statuses.push("totem-form");
  
  return statuses.length > 0 ? statuses : null;
}

export function getSpecialFormEvolution(name) {
  const normalized = normalizeName(name);
  
  const specialEvolutions = {
    "lycanroc-dusk": "Evolves from Rockruff with Own Tempo ability",
    "alcremie": "Evolves from Milcery with sweet item + spin",
    "urshifu-rapid-strike": "Evolves from Kubfu in Tower of Waters",
    "urshifu-single-strike": "Evolves from Kubfu in Tower of Darkness",
  };
  
  return specialEvolutions[normalized] || null;
}

export function getSpecialFormTypes(name) {
  const normalized = normalizeName(name);
  
  const specialTypes = {
    // Regional form type changes
    "rattata-alola": ["dark", "normal"],
    "raticate-alola": ["dark", "normal"],
    "raichu-alola": ["electric", "psychic"],
    "sandshrew-alola": ["ice", "steel"],
    "sandslash-alola": ["ice", "steel"],
    "vulpix-alola": ["ice"],
    "ninetales-alola": ["ice", "fairy"],
    "diglett-alola": ["ground", "steel"],
    "dugtrio-alola": ["ground", "steel"],
    "meowth-alola": ["dark"],
    "persian-alola": ["dark"],
    "geodude-alola": ["rock", "electric"],
    "graveler-alola": ["rock", "electric"],
    "golem-alola": ["rock", "electric"],
    "grimer-alola": ["poison", "dark"],
    "muk-alola": ["poison", "dark"],
    "exeggutor-alola": ["grass", "dragon"],
    "marowak-alola": ["fire", "ghost"],
  };
  
  return specialTypes[normalized] || null;
}

/* -------------------------------------------------------------------------- */
/* 🧠 CATEGORY DETECTION HELPERS                                              */
/* -------------------------------------------------------------------------- */

export function getSpecialCategory(name = "") {
  const n = normalizeName(name);
  const baseName = getBaseFormName(n);
  
  if (FOSSIL_POKEMON.includes(baseName)) return "fossil";
  if (ULTRA_BEASTS.includes(baseName)) return "ultra-beast";
  if (PARADOX_POKEMON.includes(baseName)) return "paradox";
  if (STARTERS.includes(baseName)) return "starter";
  if (BABY_POKEMON.includes(baseName)) return "baby";
  
  return null;
}

/* -------------------------------------------------------------------------- */
/* 🔎 BOOLEAN CHECKERS                                                       */
/* -------------------------------------------------------------------------- */

export const checkFossil = (n) => FOSSIL_POKEMON.includes(getBaseFormName(normalizeName(n)));
export const checkUltraBeast = (n) => ULTRA_BEASTS.includes(getBaseFormName(normalizeName(n)));
export const checkParadox = (n) => PARADOX_POKEMON.includes(getBaseFormName(normalizeName(n)));
export const checkStarter = (n) => STARTERS.includes(getBaseFormName(normalizeName(n)));
export const checkBaby = (n) => BABY_POKEMON.includes(getBaseFormName(normalizeName(n)));

/* -------------------------------------------------------------------------- */
/* 🧩 GRAPHQL SPECIES MAPPER                                                 */
/* -------------------------------------------------------------------------- */

export function mapSpeciesData(rawSpecies = {}, name = "") {
  const n = normalizeName(name);
  const generationId =
    rawSpecies.generation?.name?.replace("generation-", "") ||
    rawSpecies.generation_id ||
    null;

  // Use our local functions for enhanced data mapping
  const region = getSpecialFormRegion(n, rawSpecies.generation);
  const specialCategory = getSpecialCategory(n);
  const specialStatuses = getSpecialStatuses(n) || [];
  const specialEvolution = getSpecialFormEvolution(n);
  const specialTypes = getSpecialFormTypes(n) || [];

  // Combine special statuses with our category detection
  const allSpecialStatuses = [
    ...specialStatuses,
    ...(specialCategory ? [specialCategory] : [])
  ].filter(Boolean);

  return {
    name: rawSpecies.name || n,
    region,
    generation: generationId ? `gen-${generationId}` : "unknown",
    is_legendary: Boolean(rawSpecies.is_legendary),
    is_mythical: Boolean(rawSpecies.is_mythical),
    is_baby: Boolean(rawSpecies.is_baby || checkBaby(n)),
    specialStatuses: allSpecialStatuses,
    specialEvolution,
    types: specialTypes.length > 0 ? specialTypes : rawSpecies.types || [],
    evolves_from: rawSpecies.evolves_from_species?.name || null,
    evolution_chain_id: rawSpecies.evolution_chain_id || null,
    spriteSafeName: getSpriteSafeName(n),
  };
}

/* -------------------------------------------------------------------------- */
/* 🧰 UTILITY FUNCTIONS                                                       */
/* -------------------------------------------------------------------------- */

export function normalizeName(name = "") {
  if (!name) return "";
  
  return name
    .toLowerCase()
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/\s+/g, "-")
    .replace(/['.:]/g, "")
    .replace(/[^a-z0-9-]/g, "")
    .trim();
}

export function getBaseFormName(normalizedName = "") {
  if (!normalizedName) return "";
  
  return normalizedName
    .replace(/-alola$/, "")
    .replace(/-galar$/, "")
    .replace(/-hisui$/, "")
    .replace(/-paldea$/, "")
    .replace(/-gigantamax$/, "")
    .replace(/-mega$/, "")
    .replace(/-mega-x$/, "")
    .replace(/-mega-y$/, "")
    .replace(/-primal$/, "")
    .replace(/-ash$/, "")
    .replace(/-totem$/, "")
    .replace(/-ice-rider$/, "")
    .replace(/-shadow-rider$/, "")
    .replace(/-wellspring$/, "")
    .replace(/-hearthflame$/, "")
    .replace(/-cornerstone$/, "")
    .replace(/-stellar$/, "")
    .replace(/-terastal$/, "");
}

export function getSpriteSafeName(normalizedName = "") {
  if (!normalizedName) return "";
  
  if (SPECIAL_FORMS_SPRITE_MAPPING[normalizedName]) {
    return SPECIAL_FORMS_SPRITE_MAPPING[normalizedName];
  }
  
  let spriteName = normalizedName;
  
  const regionalMappings = {
    "-alola": "-alolan",
    "-galar": "-galarian", 
    "-hisui": "-hisuian",
    "-paldea": "-paldean",
    "-gmax": "-gigantamax"
  };
  
  for (const [from, to] of Object.entries(regionalMappings)) {
    if (spriteName.endsWith(from)) {
      spriteName = spriteName.replace(from, to);
      break;
    }
  }
  
  return spriteName;
}

export function checkSpriteIssues(name = "") {
  const normalized = normalizeName(name);
  const issues = [];
  
  if (name.includes("'") || name.includes(".") || name.includes(":")) {
    issues.push("Contains special characters that may affect sprite loading");
  }
  
  const problematicNames = ["farfetchd", "mr-mime", "mime-jr", "type-null", "ho-oh", "jangmo-o", "hakamo-o", "kommo-o"];
  if (problematicNames.includes(normalized)) {
    issues.push("Known sprite naming convention issue");
  }
  
  if (ULTRA_BEASTS.includes(getBaseFormName(normalized))) {
    issues.push("Ultra Beast - verify sprite availability");
  }
  
  if (PARADOX_POKEMON.includes(getBaseFormName(normalized))) {
    issues.push("Paradox Pokémon - verify sprite availability");
  }
  
  return issues;
}

/* -------------------------------------------------------------------------- */
/* 🧾 EXPORT DEFAULT                                                          */
/* -------------------------------------------------------------------------- */

export default {
  FOSSIL_POKEMON,
  ULTRA_BEASTS,
  PARADOX_POKEMON,
  STARTERS,
  BABY_POKEMON,
  SPECIAL_FORMS_SPRITE_MAPPING,
  mapGenerationToRegion,
  getPokemonRegion,
  getSpecialFormRegion,
  getSpecialStatuses,
  getSpecialFormEvolution,
  getSpecialFormTypes,
  getSpecialCategory,
  checkFossil,
  checkUltraBeast,
  checkParadox,
  checkStarter,
  checkBaby,
  mapSpeciesData,
  normalizeName,
  getBaseFormName,
  getSpriteSafeName,
  checkSpriteIssues,
};