import React, { useState } from "react";
import Cell from "./Cell";
import FloatingSearchPanel from "./FloatingSearch"; // ✅ Correct file name
import "./PuzzleGrid.css";
import { fetchPokemonDetails, fetchSpeciesByUrl } from "../utils/api";
import { getDetails, cacheDetails } from "../utils/pokemonCache";
import { getCriteriaStyle } from "../utils/criteriaStyles";
import { matchesCriterion } from "../utils/criteria";

export default function PuzzleGrid({ namesList = [], initialGrid = [] }) {
  // Ensure safe 3×3 criteria grid
  const safeGrid =
    Array.isArray(initialGrid) && initialGrid.length === 3
      ? initialGrid
      : Array(3)
          .fill(null)
          .map(() => Array(3).fill({ row: {}, col: {} }));

  // States
  const [entries, setEntries] = useState(
    Array(3).fill(null).map(() => Array(3).fill(null))
  );
  const [statuses, setStatuses] = useState(
    Array(3).fill(null).map(() => Array(3).fill("empty"))
  );
  const [activeCell, setActiveCell] = useState(null);

  // Cell click handler
  function handleCellClick(r, c) {
    setActiveCell({ r, c });
  }

  // Normalize names for sprite fetching
  function normalizeShowdownName(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-mega-(x|y)/, "meg$1")
      .replace(/-mega$/, "mega")
      .replace(/-gmax$/, "gmax")
      .replace(/-alola$/, "alola")
      .replace(/-galar$/, "galar")
      .replace(/-hisui$/, "hisui")
      .replace(/\./g, "")
      .replace(/'/g, "");
  }

  // Handle Pokémon selection
  async function handleSelectPokemon(name) {
    if (!activeCell) return;
    const { r, c } = activeCell;

    // Fetch or get cached Pokémon details
    let details = getDetails(name);
    if (!details) {
      const poke = await fetchPokemonDetails(name);
      const species = poke?.species?.url
        ? await fetchSpeciesByUrl(poke.species.url)
        : null;
      details = { poke, species };
      cacheDetails(name, details);
    }

    // Determine best image source
    const showdownName = normalizeShowdownName(name);
    const image =
      details?.poke?.sprites?.other?.["official-artwork"]?.front_default ||
      details?.poke?.sprites?.front_default ||
      `https://play.pokemonshowdown.com/sprites/ani/${showdownName}.gif`;

    // Build entry
    const pokemonEntry = {
      name,
      image,
      types: details?.poke?.types?.map(t => t.type.name.toLowerCase()) || [],
      region: details?.species?.generation?.name || "",
      is_legendary: details?.species?.is_legendary || false,
      is_mythical: details?.species?.is_mythical || false,
    };

    // Update grid entries
    const newEntries = entries.map(row => row.slice());
    newEntries[r][c] = pokemonEntry;
    setEntries(newEntries);

    // Validate against criteria
    const rowCrit = safeGrid[r][c].row;
    const colCrit = safeGrid[r][c].col;
    const isValid =
      matchesCriterion(pokemonEntry, rowCrit) &&
      matchesCriterion(pokemonEntry, colCrit);

    const newStatuses = statuses.map(row => row.slice());
    newStatuses[r][c] = isValid ? "valid" : "invalid";
    setStatuses(newStatuses);

    setActiveCell(null); // Close the floating panel after selection
  }

  // Extract criteria
  const rowCriteria = safeGrid.map(row => row?.[0]?.row || {});
  const colCriteria = safeGrid[0]?.map(col => col?.col || {}) || [];

  return (
    <div className="puzzle-container relative">
      {/* Puzzle Grid */}
      <div
        className="grid-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "80px repeat(3, 1fr)",
          gridTemplateRows: "80px repeat(3, 1fr)",
          gap: "4px",
        }}
      >
        {/* Top-left empty corner */}
        <div className="corner" style={{ gridRow: 1, gridColumn: 1 }}></div>

        {/* Column headers */}
        {colCriteria.map((crit, i) => (
          <div
            key={`col-${i}`}
            className={`criteria-header ${getCriteriaStyle(crit)}`}
            style={{ gridRow: 1, gridColumn: i + 2 }}
          >
            {crit?.value || ""}
          </div>
        ))}

        {/* Rows with cells */}
        {rowCriteria.map((rowCrit, rIdx) => (
          <React.Fragment key={`row-${rIdx}`}>
            <div
              className={`criteria-header ${getCriteriaStyle(rowCrit)}`}
              style={{ gridRow: rIdx + 2, gridColumn: 1 }}
            >
              {rowCrit?.value || ""}
            </div>

            {colCriteria.map((_, cIdx) => (
              <Cell
                key={`cell-${rIdx}-${cIdx}`}
                rIdx={rIdx}
                cIdx={cIdx}
                value={entries[rIdx][cIdx]}
                onClick={handleCellClick}
                status={statuses[rIdx][cIdx]}
                style={{
                  gridRow: rIdx + 2,
                  gridColumn: cIdx + 2,
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Floating Search Panel */}
      <FloatingSearchPanel
        isOpen={!!activeCell}
        onClose={() => setActiveCell(null)}
        onSelect={handleSelectPokemon}
        options={namesList} // expects {id, name, sprite}
      />
    </div>
  );
}
