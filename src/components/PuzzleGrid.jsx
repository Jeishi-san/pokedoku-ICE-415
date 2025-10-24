// src/components/PuzzleGrid.jsx
import React, { useState, useEffect } from "react";
import Cell from "./Cell";
import FloatingSearchPanel from "./FloatingSearch";
import "./PuzzleGrid.css";

import { fetchPokemonDetails, fetchSpeciesByName } from "../utils/api";
import { getDetails, cacheDetails } from "../utils/Pokemoncache";
import { getCriteriaStyle } from "../utils/criteriaStyles";
import { matchesCriterion } from "../utils/criteria";
import { getSpecialCategory } from "../utils/specialPokemon.js";

export default function PuzzleGrid({ initialGrid = [], onGridComplete }) {
  // ✅ Safe fallback grid
  const safeGrid =
    Array.isArray(initialGrid) && initialGrid.length
      ? initialGrid
      : Array(3)
          .fill(null)
          .map(() => Array(3).fill({ row: {}, col: {} }));

  const rowCount = safeGrid.length;
  const colCount = safeGrid[0]?.length || 3;

  const [entries, setEntries] = useState(
    Array(rowCount)
      .fill(null)
      .map(() => Array(colCount).fill(null))
  );

  const [statuses, setStatuses] = useState(
    Array(rowCount)
      .fill(null)
      .map(() => Array(colCount).fill("empty"))
  );

  const [activeCell, setActiveCell] = useState(null);
  const [usedPokemon, setUsedPokemon] = useState(new Set());
  const [movesLeft, setMovesLeft] = useState(9); // 🧩 track total allowed moves

  /** 🧩 Normalize Pokémon names for sprite URLs */
  const normalizeShowdownName = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/♀/g, "f")
      .replace(/♂/g, "m")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-mega-(x|y)/, "mega-$1")
      .replace(/-mega$/, "mega")
      .replace(/-gmax$/, "gmax")
      .replace(/-alola$/, "alola")
      .replace(/-galar$/, "galar")
      .replace(/-hisui$/, "hisui")
      .replace(/-paldea$/, "paldea");

  /** 🖱️ Handle clicking a cell */
  const handleCellClick = (r, c) => {
    if (statuses[r][c] !== "empty") return;
    setActiveCell({ r, c });
  };

  /** 🎯 Handle Pokémon selection from FloatingSearch */
  async function handleSelectPokemon(name) {
    if (!activeCell) return;
    const { r, c } = activeCell;

    const lowerName = name.toLowerCase();
    if (usedPokemon.has(lowerName)) {
      alert(`${name} has already been used!`);
      return;
    }

    try {
      // --- Fetch Pokémon details (cached if available)
      let details = getDetails(lowerName);
      if (!details) {
        const poke = await fetchPokemonDetails(lowerName);
        const species = await fetchSpeciesByName(lowerName);
        details = { poke, species };
        cacheDetails(lowerName, details);
      }

      // --- Build image URL fallback
      const showdownName = normalizeShowdownName(name);
      const image =
        details?.poke?.sprites?.other?.["official-artwork"]?.front_default ||
        details?.poke?.sprites?.front_default ||
        `https://img.pokemondb.net/sprites/home/normal/${showdownName}.png`;

      // --- Unified Pokémon entry
      const entry = {
        name,
        image,
        types: details?.poke?.types?.map((t) => t.type.name.toLowerCase()) || [],
        region: details?.species?.region || "",
        is_legendary: details?.species?.is_legendary || false,
        is_mythical: details?.species?.is_mythical || false,
        category:
          details?.species?.specialStatuses?.join(", ") ||
          getSpecialCategory(name) ||
          "Normal",
      };

      // --- Update grid
      const newEntries = entries.map((row) => row.slice());
      newEntries[r][c] = entry;
      setEntries(newEntries);

      // --- Validate criteria
      const rowCrit = safeGrid[r][c].row;
      const colCrit = safeGrid[r][c].col;
      const isValid =
        matchesCriterion(entry, rowCrit) && matchesCriterion(entry, colCrit);

      const newStatuses = statuses.map((row) => row.slice());
      newStatuses[r][c] = isValid ? "valid" : "invalid";
      setStatuses(newStatuses);

      // --- Mark Pokémon as used
      const updatedUsed = new Set(usedPokemon);
      updatedUsed.add(lowerName);
      setUsedPokemon(updatedUsed);

      // --- Reduce moves
      const updatedMoves = movesLeft - 1;
      setMovesLeft(updatedMoves);

      // --- Check win/lose conditions
      if (isGridComplete(newStatuses)) {
        onGridComplete(true); // 🎉 trigger win
      } else if (updatedMoves <= 0) {
        onGridComplete(false); // ❌ trigger lose
      }

    } catch (err) {
      console.error(`❌ Error selecting Pokémon ${name}:`, err);
      alert("Failed to load Pokémon details. Please try again.");
    } finally {
      setActiveCell(null);
    }
  }

  /** 🧮 Helper: Check if all cells are valid */
  const isGridComplete = (statusGrid) =>
    statusGrid.flat().every((s) => s === "valid");

  /** Extract grid criteria */
  const rowCriteria = safeGrid.map((row) => row?.[0]?.row || {});
  const colCriteria = safeGrid[0]?.map((col) => col?.col || {}) || [];

  return (
    <div className="puzzle-container relative">
      {/* 🔲 Grid Layout */}
      <div className="grid-layout">
        <div className="corner" />
        {colCriteria.map((crit, i) => (
          <div
            key={`col-${i}`}
            className={`criteria-header ${getCriteriaStyle(crit)}`}
            style={{ gridRow: 1, gridColumn: i + 2 }}
          >
            {crit?.value || ""}
          </div>
        ))}

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
                value={entries[rIdx]?.[cIdx] || null}
                onClick={handleCellClick}
                status={statuses[rIdx]?.[cIdx] || "empty"}
                style={{ gridRow: rIdx + 2, gridColumn: cIdx + 2 }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* 🧩 Floating Search */}
      <FloatingSearchPanel
        isOpen={!!activeCell}
        onClose={() => setActiveCell(null)}
        onSelect={handleSelectPokemon}
        activeCellCriteria={
          activeCell
            ? {
                row: rowCriteria[activeCell.r] || {},
                col: colCriteria[activeCell.c] || {},
              }
            : null
        }
      />
    </div>
  );
}
