// ✅ src/components/PuzzleGrid.jsx (With Server-Side Validation)
import React, { useState, useCallback, useMemo } from "react";
import Cell from "./Cell";
import FloatingSearchPanel from "./FloatingSearch";
import "./PuzzleGrid.css";

// FIXED: Import correct functions from api.js
import { fetchSpeciesByName, normalizeName, validatePokemon } from "../utils/api"; // ✅ ADDED validatePokemon
import { getSpeciesByName, cacheSpeciesByName } from "../utils/Pokemoncache";
import { getCriteriaStyle } from "../utils/criteriaStyles";
import { matchesCriterion } from "../utils/criteria"; // Keep for fallback

export default function PuzzleGrid({ initialGrid = [], onGridComplete }) {
  const safeGrid =
    Array.isArray(initialGrid) && initialGrid.length
      ? initialGrid
      : Array(3)
          .fill(null)
          .map(() => Array(3).fill({ row: {}, col: {} }));

  const [entries, setEntries] = useState(() =>
    Array(safeGrid.length)
      .fill(null)
      .map(() => Array(safeGrid[0]?.length || 3).fill(null))
  );
  const [statuses, setStatuses] = useState(() =>
    Array(safeGrid.length)
      .fill(null)
      .map(() => Array(safeGrid[0]?.length || 3).fill("empty"))
  );
  const [activeCell, setActiveCell] = useState(null);
  const [usedPokemon, setUsedPokemon] = useState(new Set());
  const [movesLeft, setMovesLeft] = useState(9);
  const [loadingCells, setLoadingCells] = useState(new Set());

  /* -------------------------------------------------------------------------- */
  /* 🧠 FIXED: Use imported normalizeName function                              */
  /* -------------------------------------------------------------------------- */
  const getPokemonSprite = useCallback((name) => {
    if (!name) return "";

    let key = normalizeName(name);

    // Regional + form suffix normalization
    const corrections = [
      ["-alola", "-alolan"],
      ["-galar", "-galarian"],
      ["-hisui", "-hisuian"],
      ["-paldea", "-paldean"],
      ["-gmax", "-gigantamax"],
    ];
    corrections.forEach(([from, to]) => {
      if (key.endsWith(from)) key = key.replace(from, to);
    });

    // Special cases for forms (PokémonDB-specific)
    const spriteMap = {
      "tauros-paldean": "tauros-paldean-combat",
      "tauros-paldean-aqua": "tauros-paldean-aqua",
      "tauros-paldean-blaze": "tauros-paldean-blaze",
      "ogerpon-cornerstone": "ogerpon-cornerstone",
      "ogerpon-hearthflame": "ogerpon-hearthflame",
      "ogerpon-wellspring": "ogerpon-wellspring",
      "minior-meteor": "minior-meteor",
      "minior-blue": "minior-blue-core",
      "minior-green": "minior-green-core",
      "minior-indigo": "minior-indigo-core",
      "minior-orange": "minior-orange-core",
      "minior-red": "minior-red-core",
      "minior-violet": "minior-violet-core",
      "minior-yellow": "minior-yellow-core",
      "terapagos-stellar": "terapagos-stellar",
      "terapagos-terastal": "terapagos-terastal",
      "toxtricity-gmax": "toxtricity-gigantamax",
      "toxtricity-amped-gmax": "toxtricity-gigantamax",
      "toxtricity-low-key-gmax": "toxtricity-gigantamax",
      "calyrex-ice": "calyrex-ice-rider",
      "calyrex-shadow": "calyrex-shadow-rider",
    };
    if (spriteMap[key]) key = spriteMap[key];

    return `https://img.pokemondb.net/sprites/home/normal/${key}.png`;
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Cell click handler                                                      */
  /* -------------------------------------------------------------------------- */
  const handleCellClick = useCallback(
    (r, c) => {
      if (statuses[r][c] === "empty" && !loadingCells.has(`${r}-${c}`)) {
        setActiveCell({ r, c });
      }
    },
    [statuses, loadingCells]
  );

  /* -------------------------------------------------------------------------- */
  /* 🧩 Pokémon selection handler (UPDATED WITH SERVER-SIDE VALIDATION)        */
  /* -------------------------------------------------------------------------- */
  const handleSelectPokemon = useCallback(
    async (name) => {
      if (!activeCell) return;
      const { r, c } = activeCell;
      const cellKey = `${r}-${c}`;
      const lowerName = name.toLowerCase();

      if (usedPokemon.has(lowerName)) {
        alert(`${name} has already been used!`);
        return;
      }

      // Set loading state
      setLoadingCells(prev => new Set([...prev, cellKey]));

      try {
        let speciesData = getSpeciesByName(lowerName);
        if (!speciesData) {
          // FIXED: Use fetchSpeciesByName from your api.js
          speciesData = await fetchSpeciesByName(lowerName);
          if (speciesData) cacheSpeciesByName(lowerName, speciesData);
        }

        const entry = {
          name,
          image: getPokemonSprite(name),
          types: speciesData?.types || [],
          region: speciesData?.region || "Unknown",
          evolution: speciesData?.evolution || "Unknown",
          statuses: speciesData?.statuses || ["Normal Pokémon"],
          generation: speciesData?.generation || "Unknown",
        };

        // ✅ Update state immediately with the Pokémon entry
        setEntries((prev) => {
          const newEntries = prev.map((row) => [...row]);
          newEntries[r][c] = entry;
          return newEntries;
        });

        const rowCrit = safeGrid[r][c].row;
        const colCrit = safeGrid[r][c].col;

        // 🎯 SERVER-SIDE VALIDATION
        let isValid = false;
        try {
          console.log(`🎯 Validating ${name} at [${r},${c}]...`);
          const validationResult = await validatePokemon(name, rowCrit, colCrit);
          isValid = validationResult.isValid;
          console.log(`✅ Server validation result for ${name}:`, isValid);
        } catch (validationError) {
          console.warn("⚠️ Server validation failed, using client-side fallback:", validationError);
          // Fallback to client-side validation
          isValid = matchesCriterion(entry, rowCrit) && matchesCriterion(entry, colCrit);
          console.log(`🔄 Client-side fallback result for ${name}:`, isValid);
        }

        // ✅ Update status based on validation result
        setStatuses((prev) => {
          const newStatuses = prev.map((row) => [...row]);
          newStatuses[r][c] = isValid ? "valid" : "invalid";
          return newStatuses;
        });

        setUsedPokemon((prev) => new Set([...prev, lowerName]));
        setMovesLeft((prev) => prev - 1);

        // ✅ Check completion
        setTimeout(() => {
          const newStatusesFlat = [...statuses];
          newStatusesFlat[r][c] = isValid ? "valid" : "invalid";
          const newAllValid = newStatusesFlat.flat().every((s) => s === "valid");
          
          if (newAllValid) {
            console.log("🎉 Puzzle completed successfully!");
            onGridComplete?.(true);
          } else if (movesLeft - 1 <= 0) {
            console.log("💔 Out of moves - puzzle failed");
            onGridComplete?.(false);
          }
        }, 100);

      } catch (err) {
        console.error("❌ Error loading Pokémon:", err);
        setStatuses((prev) => {
          const newStatuses = prev.map((row) => [...row]);
          newStatuses[r][c] = "error";
          return newStatuses;
        });
        alert("Failed to load Pokémon. Please try again.");
      } finally {
        setLoadingCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
        setActiveCell(null);
      }
    },
    [activeCell, usedPokemon, statuses, movesLeft, safeGrid, onGridComplete, getPokemonSprite]
  );

  /* -------------------------------------------------------------------------- */
  /* 🧮 Derived state                                                           */
  /* -------------------------------------------------------------------------- */
  const rowCriteria = useMemo(
    () => safeGrid.map((row) => row?.[0]?.row || {}),
    [safeGrid]
  );
  const colCriteria = useMemo(
    () => safeGrid[0]?.map((col) => col?.col || {}) || [],
    [safeGrid]
  );

  const activeCellCriteria = useMemo(() => {
    if (!activeCell) return null;
    return {
      row: rowCriteria[activeCell.r],
      col: colCriteria[activeCell.c],
    };
  }, [activeCell, rowCriteria, colCriteria]);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Close search handler                                                    */
  /* -------------------------------------------------------------------------- */
  const handleCloseSearch = useCallback(() => setActiveCell(null), []);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Get cell status with loading                                            */
  /* -------------------------------------------------------------------------- */
  const getCellStatus = useCallback((r, c) => {
    const cellKey = `${r}-${c}`;
    if (loadingCells.has(cellKey)) return "loading";
    return statuses[r]?.[c] || "empty";
  }, [statuses, loadingCells]);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Render                                                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="puzzle-container">
      <div className="grid-layout" style={{
        gridTemplateColumns: `80px repeat(${colCriteria.length}, 80px)`,
        gridTemplateRows: `80px repeat(${rowCriteria.length}, 80px)`
      }}>
        {/* Top-left corner */}
        <div className="corner" />
        
        {/* Column headers */}
        {colCriteria.map((crit, i) => (
          <div
            key={`col-${i}`}
            className={`criteria-header ${getCriteriaStyle(crit)}`}
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {crit?.value || ""}
          </div>
        ))}
        
        {/* Row headers and cells */}
        {rowCriteria.map((rowCrit, rIdx) => (
          <React.Fragment key={`row-${rIdx}`}>
            {/* Row header */}
            <div 
              className={`criteria-header ${getCriteriaStyle(rowCrit)}`}
              style={{ gridColumn: 1, gridRow: rIdx + 2 }}
            >
              {rowCrit?.value || ""}
            </div>
            
            {/* Cells in this row */}
            {colCriteria.map((_, cIdx) => (
              <Cell
                key={`cell-${rIdx}-${cIdx}`}
                value={entries[rIdx]?.[cIdx]}
                onClick={() => handleCellClick(rIdx, cIdx)}
                status={getCellStatus(rIdx, cIdx)}
                style={{ 
                  gridColumn: cIdx + 2, 
                  gridRow: rIdx + 2 
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <FloatingSearchPanel
        isOpen={!!activeCell}
        onClose={handleCloseSearch}
        onSelect={handleSelectPokemon}
        activeCellCriteria={activeCellCriteria}
      />

      <div className="game-info">
        <div>🎮 Moves Left: {movesLeft}</div>
        <div>📊 Used Pokémon: {usedPokemon.size}</div>
        <div className="validation-info">🎯 Server-Side Validation: Active</div>
      </div>
    </div>
  );
}