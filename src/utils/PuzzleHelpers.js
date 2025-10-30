/**
 * ✅ Universal Pokémon Puzzle Helper Module
 * Works seamlessly in both frontend (React) and backend (Node.js + Express ESM)
 * Provides random Pokémon puzzle criteria and grid generation
 */

/* -------------------------------------------------------------------------- */
/* 🧩 Static Game Data                                                        */
/* -------------------------------------------------------------------------- */

export const TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

export const REGIONS = [
  "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova",
  "Kalos", "Alola", "Galar", "Paldea"
];

export const SPECIALS = [
  "Legendary", "Mythical", "Starter", "Fossil",
  "Ultra Beast", "Paradox", "Baby"
];

export const EVOLUTION_STAGES = [
  "First Stage", "Middle Stage", "Final Stage"
];

/* -------------------------------------------------------------------------- */
/* 🧠 Utility Functions                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Pick a random element from an array
 * @param {Array} arr
 * @returns {*}
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a single random puzzle criterion
 * @returns {{ kind: "type"|"region"|"special"|"evolution", value: string }}
 */
const randomCriterion = () => {
  const rand = Math.random();

  const kind =
    rand < 0.5 ? "type" :
    rand < 0.75 ? "region" :
    rand < 0.9 ? "special" :
    "evolution";

  const source =
    kind === "type" ? TYPES :
    kind === "region" ? REGIONS :
    kind === "special" ? SPECIALS :
    EVOLUTION_STAGES;

  return { kind, value: pick(source) };
};

/**
 * Generate an array of 3 random criteria
 * @returns {Array<{kind: string, value: string}>}
 */
export const randomCriteriaList = () =>
  Array.from({ length: 3 }, randomCriterion);

/**
 * Combine row and column criteria into a 3x3 puzzle grid
 * @param {Array} rows - array of { kind, value }
 * @param {Array} cols - array of { kind, value }
 * @returns {Array<Array<{row: {}, col: {}}>>}
 */
export const buildGrid = (rows, cols) =>
  rows.map((r) => cols.map((c) => ({ row: r, col: c })));

/**
 * Generate a complete random Pokémon puzzle
 * @returns {{ rows: Array, cols: Array, grid: Array }}
 */
export const generatePuzzle = () => {
  const rows = randomCriteriaList();
  const cols = randomCriteriaList();
  return { rows, cols, grid: buildGrid(rows, cols) };
};

/* -------------------------------------------------------------------------- */
/* 🧩 Dual Environment Support (Frontend + Backend)                           */
/* -------------------------------------------------------------------------- */
/**
 * This block ensures compatibility with both:
 * - Frontend (ESM via Vite)
 * - Backend (ESM via Node.js)
 * - Optional CommonJS fallback (if imported dynamically)
 */
try {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      TYPES,
      REGIONS,
      SPECIALS,
      EVOLUTION_STAGES,
      randomCriteriaList,
      buildGrid,
      generatePuzzle,
    };
  }
} catch (_) {
  // No-op in browser (Vite/React)
}
