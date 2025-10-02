import React, { useState } from "react";
import Cell from "./Cell";
import "./PuzzleGrid.css";
import Autocomplete from "./Autocomplete";
import { fetchPokemonDetails, fetchSpeciesByUrl } from "../utils/api";
import { getDetails, cacheDetails } from "../utils/pokemonCache";
import { getCriteriaStyle } from "../utils/criteriaStyles";
import { matchesCriterion } from "../utils/criteria"; // 🔑 import validator

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

  // 🔧 Normalize Showdown naming for special forms
  function normalizeShowdownName(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // spaces → dashes
      .replace(/-mega-(x|y)/, "meg$1")
      .replace(/-mega$/, "mega")
      .replace(/-gmax$/, "gmax")
      .replace(/-alola$/, "alola")
      .replace(/-galar$/, "galar")
      .replace(/-hisui$/, "hisui")
      .replace(/\./g, "")
      .replace(/'/g, ""); // mr. mime → mrmime
  }

  // Select Pokémon
  async function handleSelectPokemon(name) {
    if (!activeCell) return;
    const { r, c } = activeCell;

    // ✅ Get cached details or fetch new
    let details = getDetails(name);
    if (!details) {
      const poke = await fetchPokemonDetails(name);
      const species = poke?.species?.url
        ? await fetchSpeciesByUrl(poke.species.url)
        : null;
      details = { poke, species };
      cacheDetails(name, details);
    }

    // ✅ Safe image fallback chain
    const showdownName = normalizeShowdownName(name);
    const image =
      details?.poke?.sprites?.other?.["official-artwork"]?.front_default ||
      details?.poke?.sprites?.front_default ||
      `https://play.pokemonshowdown.com/sprites/ani/${showdownName}.gif`;

    // Build entry
    const pokemonEntry = {
      name,
      image,
      types: details?.poke?.types?.map((t) => t.type.name.toLowerCase()) || [],
      region: details?.species?.generation?.name || "",
      is_legendary: details?.species?.is_legendary || false,
      is_mythical: details?.species?.is_mythical || false,
    };

    // Update entries
    const newEntries = entries.map((row) => row.slice());
    newEntries[r][c] = pokemonEntry;
    setEntries(newEntries);

    // ✅ Validate with helper
    const rowCrit = safeGrid[r][c].row;
    const colCrit = safeGrid[r][c].col;
    const isValid =
      matchesCriterion(pokemonEntry, rowCrit) &&
      matchesCriterion(pokemonEntry, colCrit);

    const newStatuses = statuses.map((row) => row.slice());
    newStatuses[r][c] = isValid ? "valid" : "invalid";
    setStatuses(newStatuses);

    setActiveCell(null);
  }

  // Extract row + col criteria safely
  const rowCriteria = safeGrid.map((row) => row?.[0]?.row || {});
  const colCriteria = safeGrid[0]?.map((col) => col?.col || {}) || [];

  return (
    <div className="puzzle-container">
      <div
        className="grid-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "80px repeat(3, 1fr)",
          gridTemplateRows: "80px repeat(3, 1fr)",
          gap: "4px",
        }}
      >
        {/* Empty corner */}
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

        {/* Rows + cells */}
        {rowCriteria.map((rowCrit, rIdx) => (
          <React.Fragment key={`row-${rIdx}`}>
            {/* Row header */}
            <div
              className={`criteria-header ${getCriteriaStyle(rowCrit)}`}
              style={{ gridRow: rIdx + 2, gridColumn: 1 }}
            >
              {rowCrit?.value || ""}
            </div>

            {/* Row cells */}
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

      {activeCell && (
        <div className="picker">
          <h4>
            Pick Pokémon for ({activeCell.r + 1}, {activeCell.c + 1})
          </h4>
          <Autocomplete namesList={namesList} onSelect={handleSelectPokemon} />
        </div>
      )}
    </div>
  );
}
