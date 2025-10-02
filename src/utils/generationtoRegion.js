// src/utils/generationToRegion.js
export const generationToRegion = {
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

export function generationToRegionName(genObj) {
  if (!genObj || !genObj.name) return "Unknown";
  return generationToRegion[genObj.name] || "Unknown";
}
