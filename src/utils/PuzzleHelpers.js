// src/utils/PuzzleHelpers.js

export const TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

export const REGIONS = [
  "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova",
  "Kalos", "Alola", "Galar", "Paldea"
];

// ✅ Expanded Specials (now includes Baby Pokémon)
export const SPECIALS = [
  "Legendary",
  "Mythical",
  "Starter",
  "Fossil",
  "Ultra Beast",
  "Paradox",
  "Baby" // 🍼 Newly added category
];

/**
 * Generate a random list of 3 criteria (rows or columns)
 * @returns {Array<{kind: string, value: string}>}
 */
export function randomCriteriaList() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const criteria = [];

  for (let i = 0; i < 3; i++) {
    const rand = Math.random();
    let kind;

    // 🧩 Weighted selection: mostly types, then regions, fewer specials
    if (rand < 0.55) kind = "type";
    else if (rand < 0.8) kind = "region";
    else kind = "special";

    const value =
      kind === "type"
        ? pick(TYPES)
        : kind === "region"
        ? pick(REGIONS)
        : pick(SPECIALS);

    criteria.push({ kind, value });
  }

  return criteria;
}

/**
 * Build a 3x3 grid combining row and column criteria
 * @param {Array} rows - array of { kind, value }
 * @param {Array} cols - array of { kind, value }
 * @returns {Array<Array<{row: {}, col: {}}>>}
 */
export function buildGrid(rows, cols) {
  return rows.map((rowHeader) =>
    cols.map((colHeader) => ({
      row: rowHeader,
      col: colHeader
    }))
  );
}
