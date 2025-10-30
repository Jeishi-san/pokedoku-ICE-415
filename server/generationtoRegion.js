// ✅ Canonical generation → region mapping
const generationToRegion = {
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

/**
 * Convert generation data or slug → readable region name
 */
export const mapGenerationToRegion = (gen) => {
  const key = typeof gen === "string" ? gen : gen?.name;
  return generationToRegion[key] || "Unknown";
};

/**
 * Base-region overrides (optional, small list for common mons)
 * Ensures forms correctly resolve without API fetch
 */
const baseRegionOverrides = {
  lucario: "Sinnoh",
  charizard: "Kanto",
  venusaur: "Kanto",
  pikachu: "Kanto",
  ninetales: "Kanto",
  snorlax: "Kanto",
};

/**
 * Determine Pokémon's region (handles forms, fossils, legends, etc.)
 * Mega & Gigantamax follow base form's region
 */
export function getPokemonRegion(name, generation) {
  if (!name) return "Unknown";
  const lower = name.toLowerCase();
  const baseName = lower.replace(/-.*/, "");

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

  // Special forms → recursively resolve base
  if (/-mega|primal/.test(lower) || /-gmax/.test(lower)) {
    return getPokemonRegion(baseName, generation);
  }

  // Paradox Pokémon → Paldea
  const paradoxList = [
    "great-tusk","scream-tail","brute-bonnet","flutter-mane",
    "slither-wing","sandy-shocks","iron-treads","iron-bundle",
    "iron-hands","iron-jugulis","iron-moth","iron-thorns",
    "roaring-moon","iron-valiant","walking-wake","iron-leaves",
    "gouging-fire","raging-bolt","iron-boulder","iron-crown"
  ];
  if (paradoxList.includes(lower)) return "Paldea";

  // Ultra Beasts → Alola
  const ultraBeasts = [
    "nihilego","buzzwole","pheromosa","xurkitree","celesteela",
    "kartana","guzzlord","poipole","naganadel","stakataka","blacephalon"
  ];
  if (ultraBeasts.includes(lower)) return "Alola";

  // Base-region override
  if (baseRegionOverrides[baseName]) return baseRegionOverrides[baseName];

  // Fallback: generation mapping
  return mapGenerationToRegion(generation);
}

/**
 * Region + debug info
 */
export function getPokemonRegionWithDebug(name, generation) {
  const region = getPokemonRegion(name, generation);
  return {
    name,
    region,
    generation: typeof generation === "string" ? generation : generation?.name,
    detectedVia: detectMethod(name),
  };
}

function detectMethod(name) {
  const n = name.toLowerCase();
  if (/-alola/.test(n)) return "alolan-form";
  if (/-galar/.test(n)) return "galarian-form";
  if (/-hisui/.test(n)) return "hisuian-form";
  if (/-paldea/.test(n)) return "paldean-form";
  if (/-mega/.test(n)) return "mega-form";
  if (/-gmax/.test(n)) return "gigantamax-form";
  if (/-primal/.test(n)) return "primal-form";
  return "generation-mapping";
}
