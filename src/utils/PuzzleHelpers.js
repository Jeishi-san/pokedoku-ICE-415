// src/utils/PuzzleHelpers.js

export const TYPES = [
  "Normal","Fire","Water","Grass","Electric","Ice",
  "Fighting","Poison","Ground","Flying","Psychic","Bug",
  "Rock","Ghost","Dragon","Dark","Steel","Fairy"
];

export const REGIONS = [
  "Kanto","Johto","Hoenn","Sinnoh","Unova",
  "Kalos","Alola","Galar","Paldea"
];

export const SPECIALS = ["Legendary","Mythical","Starter","Fossil"];

/**
 * Pick n random unique items from an array
 */
function pickRandomUnique(arr, n) {
  const pool = [...arr];
  const result = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

/**
 * Generate random criteria list for either rows or columns
 * Each entry is { kind: 'type'|'region'|'special', value: string }
 */
export function randomCriteriaList() {
  const headers = [];

  // For variety: roughly 60% types, 25% regions, 15% specials
  for (let i = 0; i < 3; i++) {
    const r = Math.random();
    let kind, value;

    if (r < 0.6) {
      kind = "type";
      value = pickRandomUnique(TYPES, 1)[0];
    } else if (r < 0.85) {
      kind = "region";
      value = pickRandomUnique(REGIONS, 1)[0]; // ✅ same region strings as generationToRegion
    } else {
      kind = "special";
      value = pickRandomUnique(SPECIALS, 1)[0];
    }

    headers.push({ kind, value });
  }

  return headers;
}

/**
 * Build 3×3 grid by combining row and column criteria
 * Each cell is { row: {kind,value}, col: {kind,value} }
 */
export function buildGrid(rows, cols) {
  return rows.map(rowHeader =>
    cols.map(colHeader => ({
      row: rowHeader,
      col: colHeader
    }))
  );
}
