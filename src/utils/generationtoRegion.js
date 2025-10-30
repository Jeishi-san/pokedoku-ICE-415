// src/utils/generationToRegion.js

// Canonical mapping from PokeAPI generation IDs to human-readable regions
export const generationToRegion = {
  // Numeric IDs
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",

  // String slugs (from backend GraphQL/REST)
  "generation-i": "Kanto",
  "generation-ii": "Johto",
  "generation-iii": "Hoenn",
  "generation-iv": "Sinnoh",
  "generation-v": "Unova",
  "generation-vi": "Kalos",
  "generation-vii": "Alola",
  "generation-viii": "Galar",
  "generation-ix": "Paldea",

  // Alternative formats
  "gen-1": "Kanto",
  "gen-2": "Johto",
  "gen-3": "Hoenn",
  "gen-4": "Sinnoh",
  "gen-5": "Unova",
  "gen-6": "Kalos",
  "gen-7": "Alola",
  "gen-8": "Galar",
  "gen-9": "Paldea",
};

/**
 * Converts a generation ID (number or string) into a readable region name.
 * @param {number|string} generationId
 * @returns {string} Region name or "Unknown"
 */
export function generationToRegionName(generationId) {
  if (!generationId) return "Unknown";
  return generationToRegion[generationId] || "Unknown";
}

/**
 * Enhanced region detection that handles special edge cases
 */
export function getPokemonRegion(name, generationId) {
  if (!name) return generationToRegionName(generationId);
  const lowerName = name.toLowerCase().trim();

  // 🗺️ Regional Forms
  if (lowerName.includes("-alola")) return "Alola";
  if (lowerName.includes("-galar")) return "Galar";
  if (lowerName.includes("-hisui")) return "Hisui";
  if (lowerName.includes("-paldea")) return "Paldea";

  // 💥 Gigantamax forms (Gmax)
  if (lowerName.includes("-gmax")) return "Galar";

  // ⚡ Mega Evolutions
  if (lowerName.includes("-mega")) return "Kalos";
  if (lowerName.includes("-primal")) return "Hoenn";
  if (lowerName.includes("-eternamax")) return "Galar"; // Eternatus special case

  // 🦴 Fossils (spread across regions)
  const fossilKeywords = [
    "aerodactyl",
    "kabuto",
    "omanyte",
    "anorith",
    "lileep",
    "cranidos",
    "shieldon",
    "archen",
    "tirtouga",
    "amaura",
    "tyrunt",
    "dracozolt",
    "arctozolt",
    "dracovish",
    "arctovish",
  ];
  if (fossilKeywords.some((f) => lowerName.includes(f))) {
    // Return based on generation grouping
    if (["dracozolt", "arctozolt", "dracovish", "arctovish"].some((f) => lowerName.includes(f))) return "Galar";
    if (["amaura", "tyrunt"].some((f) => lowerName.includes(f))) return "Kalos";
    if (["archen", "tirtouga"].some((f) => lowerName.includes(f))) return "Unova";
    if (["cranidos", "shieldon"].some((f) => lowerName.includes(f))) return "Sinnoh";
    if (["anorith", "lileep"].some((f) => lowerName.includes(f))) return "Hoenn";
    return "Kanto";
  }

  // 🌌 Legendary & Mythical Pokémon checks
  const legendaryMythicalPatterns = [
    "mewtwo", "mew", "lugia", "ho-oh", "rayquaza", "groudon", "kyogre",
    "dialga", "palkia", "giratina", "arceus", "zekrom", "reshiram",
    "kyurem", "xerneas", "yveltal", "zygarde", "solgaleo", "lunala",
    "necrozma", "zacian", "zamazenta", "eternatus", "koraidon", "miraidon"
  ];
  if (legendaryMythicalPatterns.some((nameFragment) => lowerName.includes(nameFragment))) {
    // Match known regions of debut
    if (["mewtwo", "mew"].some((f) => lowerName.includes(f))) return "Kanto";
    if (["lugia", "ho-oh"].some((f) => lowerName.includes(f))) return "Johto";
    if (["rayquaza", "groudon", "kyogre"].some((f) => lowerName.includes(f))) return "Hoenn";
    if (["dialga", "palkia", "giratina", "arceus"].some((f) => lowerName.includes(f))) return "Sinnoh";
    if (["zekrom", "reshiram", "kyurem"].some((f) => lowerName.includes(f))) return "Unova";
    if (["xerneas", "yveltal", "zygarde"].some((f) => lowerName.includes(f))) return "Kalos";
    if (["solgaleo", "lunala", "necrozma"].some((f) => lowerName.includes(f))) return "Alola";
    if (["zacian", "zamazenta", "eternatus"].some((f) => lowerName.includes(f))) return "Galar";
    if (["koraidon", "miraidon"].some((f) => lowerName.includes(f))) return "Paldea";
  }

  // 🌀 Paradox Pokémon (Scarlet & Violet)
  const paradoxPatterns = [
    "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing",
    "sandy-shocks", "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis",
    "iron-moth", "iron-thorns"
  ];
  if (paradoxPatterns.some((f) => lowerName.includes(f))) return "Paldea";

  // 🧭 Default fallback: use generation mapping
  return generationToRegionName(generationId);
}
