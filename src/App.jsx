// src/App.jsx
import React, { useEffect, useState } from "react";
import "./styles.css";
import { fetchAllPokemonNames } from "./utils/api";
import { cacheNames, getNames } from "./utils/pokemonCache";
import PuzzleGrid from "./components/PuzzleGrid";
import { randomCriteriaList, buildGrid } from "./utils/PuzzleHelpers";

function App() {
  const [namesList, setNamesList] = useState([]);
  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);

  useEffect(() => {
    // ✅ Generate puzzle criteria
    const rowCriteria = randomCriteriaList();
    const colCriteria = randomCriteriaList();
    setRows(rowCriteria);
    setCols(colCriteria);
    setGrid(buildGrid(rowCriteria, colCriteria));

    // ✅ Load Pokémon names
    const cached = getNames();
    if (cached.length) {
      setNamesList(cached);
    } else {
      fetchAllPokemonNames().then((names) => {
        cacheNames(names);
        setNamesList(names);
      });
    }
  }, []);

  return (
    <div className="app">
      <h1 className="title">Pokedoku</h1>
      {grid.length > 0 && namesList.length > 0 ? (
        <PuzzleGrid namesList={namesList} initialGrid={grid} rows={rows} cols={cols} />
      ) : (
        <p>Loading puzzle...</p>
      )}
    </div>
  );
}

export default App;
