// src/App.jsx
import React, { useEffect, useState } from "react";
import "./styles.css";
import PuzzleGrid from "./components/PuzzleGrid";
import GamePanels from "./components/GamePanels";
import { fetchAllPokemonNames } from "./utils/api";
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
  const [gameOver, setGameOver] = useState(false); // 🆕 Added for lose condition or move exhaustion

  /** 🧩 Initialize puzzle on mount */
  useEffect(() => {
    async function initPuzzle() {
      try {
        const rowCriteria = randomCriteriaList();
        const colCriteria = randomCriteriaList();
        setRows(rowCriteria);
        setCols(colCriteria);
        setGrid(buildGrid(rowCriteria, colCriteria));

        let pokemonNames = getNames();
        if (!pokemonNames.length) {
          const fetchedNames = await fetchAllPokemonNames();
          cacheNames(fetchedNames);
          pokemonNames = fetchedNames;
        }
        setNamesList(pokemonNames);
      } catch (err) {
        console.error("⚠️ Failed to initialize PokéDoku puzzle:", err);
      } finally {
        setLoading(false);
      }
    }

    initPuzzle();
  }, []);

  /** 🎯 Triggered when the grid is successfully completed */
  const handleGridComplete = () => {
    setShowWin(true);
  };

  /** 💀 Triggered when the player loses or runs out of moves */
  const handleGameOver = () => {
    setGameOver(true);
  };

  /** 🔁 Restart the game (generate a new puzzle) */
  const handleRestart = () => {
    setShowWin(false);
    setShowRules(false);
    setGameOver(false);
    setLoading(true);

    const rowCriteria = randomCriteriaList();
    const colCriteria = randomCriteriaList();
    setRows(rowCriteria);
    setCols(colCriteria);
    setGrid(buildGrid(rowCriteria, colCriteria));

    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-6">
      {/* 🔝 Header */}
      <header className="flex justify-between items-center w-full max-w-3xl px-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          PokéDoku
        </h1>
        <button
          onClick={() => setShowRules(true)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
        >
          How to Play
        </button>
      </header>

      {/* 🧩 Main Game Area */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300 mt-20">
          Loading puzzle...
        </p>
      ) : (
        <PuzzleGrid
          namesList={namesList}
          initialGrid={grid}
          rows={rows}
          cols={cols}
          onGridComplete={handleGridComplete}
          onGameOver={handleGameOver} // 🆕 Added callback
        />
      )}

      {/* 🎉 Win / Lose + 📜 Rules Panel */}
      <GamePanels
        showWin={showWin}
        showRules={showRules}
        showLose={gameOver}
        onCloseWin={() => setShowWin(false)}
        onCloseRules={() => setShowRules(false)}
        onCloseLose={() => setGameOver(false)}
        onRestart={handleRestart}
      />
    </div>
  );
}
