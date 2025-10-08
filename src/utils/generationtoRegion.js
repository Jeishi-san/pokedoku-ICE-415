// src/utils/generationToRegion.js
<<<<<<< HEAD

// Canonical mapping from API generation slug to fan-friendly region name
=======
>>>>>>> c0a86ffe70fb89df99cc36aa22ff47b91e7ba2a3
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

<<<<<<< HEAD
/**
 * Convert a PokeAPI generation object or slug to a readable region name
 * @param {Object|string} genObj
 * @returns {string}
 */
export function generationToRegionName(genObj) {
  if (!genObj) return "Unknown";

  // if given an object with a .name property
  const slug = typeof genObj === "string" ? genObj : genObj.name;

  return generationToRegion[slug] || "Unknown";
=======
export function generationToRegionName(genObj) {
  if (!genObj || !genObj.name) return "Unknown";
  return generationToRegion[genObj.name] || "Unknown";
>>>>>>> c0a86ffe70fb89df99cc36aa22ff47b91e7ba2a3
}
