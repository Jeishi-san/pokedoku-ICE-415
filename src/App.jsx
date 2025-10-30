// src/App.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./styles.css";
import PuzzleGrid from "./components/PuzzleGrid";
import GamePanels from "./components/GamePanels";
import RulesPanel from "./components/RulesPanel";
import { fetchAllPokemonNamesLazy } from "./utils/api";
import { cacheNames, getNames } from "./utils/Pokemoncache";
import { randomCriteriaList, buildGrid } from "./utils/PuzzleHelpers";

export default function App() {
  const [namesList, setNamesList] = useState([]);
  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Initialize Puzzle Logic                                                 */
  /* -------------------------------------------------------------------------- */
  const initPuzzle = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    setShowWin(false);
    setGameOver(false);

    try {
      // Generate random criteria for the puzzle
      const rowCriteria = randomCriteriaList(3);
      const colCriteria = randomCriteriaList(3);

      setRows(rowCriteria);
      setCols(colCriteria);
      setGrid(buildGrid(rowCriteria, colCriteria));

      // Save criteria for persistence
      localStorage.setItem(
        "pokedoku-lastCriteria",
        JSON.stringify({ rowCriteria, colCriteria })
      );

      // Fetch Pokémon names lazily
      let pokemonNames = getNames();

      if (!pokemonNames.length) {
        const fetchedNames = await fetchAllPokemonNamesLazy();

        if (signal?.aborted) return; // cancel early if unmounted

        if (!Array.isArray(fetchedNames) || !fetchedNames.length) {
          throw new Error("Empty Pokémon name list received.");
        }

        cacheNames(fetchedNames);
        pokemonNames = fetchedNames;
      }

      // Clean and normalize names for searching
      const cleanedNames = pokemonNames
        .filter((n) => typeof n === "string" && n.trim().length > 0)
        .map((n) => ({
          display: n.trim(), // Original name (for sprites)
          searchKey: n.trim().toLowerCase(), // For searching
        }));

      setNamesList(cleanedNames);
      setLoading(false);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("❌ Failed to initialize PokéDoku:", err);
      setError(err.message || "Failed to load puzzle data.");
      setNamesList([]);
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /* ⚙️ Mount Effect                                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();
    initPuzzle(controller.signal);
    return () => controller.abort();
  }, [initPuzzle]);

  /* -------------------------------------------------------------------------- */
  /* 🎯 Handlers                                                               */
  /* -------------------------------------------------------------------------- */
  const handleGridComplete = (isWin) => {
    setShowWin(isWin);
    setGameOver(!isWin);
  };

  const handleRestart = () => {
    setShowWin(false);
    setGameOver(false);
    setShowRules(false);
    initPuzzle();
  };

  const handleQuickRestart = handleRestart;

  /* -------------------------------------------------------------------------- */
  /* 🎨 Render States                                                          */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">PokéDoku</h1>
          <button
            onClick={() => setShowRules(true)}
            className="rules-button"
            aria-label="How to Play"
          >
            How to Play
          </button>
        </header>
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p className="loading-text">🔄 Loading puzzle...</p>
          <p className="loading-subtext">Preparing your Pokémon challenge</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">PokéDoku</h1>
          <button
            onClick={() => setShowRules(true)}
            className="rules-button"
            aria-label="How to Play"
          >
            How to Play
          </button>
        </header>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-text">Failed to load puzzle</p>
          <p className="error-details">{error}</p>
          <div className="error-actions">
            <button onClick={() => initPuzzle()} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🧩 Main Game Layout                                                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">⚬</span>
            PokéDoku
          </h1>
          <div className="header-actions">
            <button
              onClick={handleQuickRestart}
              className="restart-button"
              aria-label="Restart Game"
            >
              🔄 Restart
            </button>
            <button
              onClick={() => setShowRules(true)}
              className="rules-button"
              aria-label="How to Play"
            >
              ❓ How to Play
            </button>
          </div>
        </div>
      </header>

      <main className="game-main">
        <PuzzleGrid
          namesList={namesList}
          initialGrid={grid}
          rows={rows}
          cols={cols}
          onGridComplete={handleGridComplete}
        />
      </main>

      <GamePanels
        showWin={showWin}
        showLose={gameOver}
        onCloseWin={() => setShowWin(false)}
        onCloseLose={() => setGameOver(false)}
        onRestart={handleRestart}
      />

      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}

      <footer className="game-footer">
        <button
          onClick={handleQuickRestart}
          className="footer-button"
          aria-label="Quick Restart"
        >
          🔄 New Puzzle
        </button>
        <button
          onClick={() => setShowRules(true)}
          className="footer-button"
          aria-label="View Rules"
        >
          📖 Rules
        </button>
      </footer>
    </div>
  );
}