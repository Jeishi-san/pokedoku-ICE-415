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

export function randomCriteriaList() {
  // create three row criteria and three column criteria drawing from these categories
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const headerPool = [];
  for (let i = 0; i < 3; i++) {
    // random kind
    const kind = Math.random() < 0.6 ? "type" : (Math.random() < 0.5 ? "region" : "special");
    const value =
      kind === "type"
        ? pick(TYPES)
        : kind === "region"
        ? pick(REGIONS)
        : pick(SPECIALS);
    headerPool.push({ kind, value });
  }
  return headerPool;
}

export function buildGrid(rows, cols) {
  // build 3x3 grid combining row/col headers
  return rows.map(rowHeader =>
    cols.map(colHeader => ({ row: rowHeader, col: colHeader }))
  );
}
