// src/components/FloatingSearch.jsx
import React, { useEffect, useState } from "react";
import Autocomplete from "./Autocomplete";
import "./FloatingSearch.css";
import { fetchAllPokemonNames } from "../utils/api"; // ✅ backend connection

export default function FloatingSearchPanel({
  isOpen,
  onClose,
  onSelect,
  activeCellCriteria = null, // { row: { value }, col: { value } }
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch Pokémon list from backend when panel opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchAllPokemonNames()
      .then(setOptions)
      .catch((err) => console.error("❌ Failed to load Pokémon list:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // 🏷️ Format criteria text
  const rowCrit = activeCellCriteria?.row?.value || "";
  const colCrit = activeCellCriteria?.col?.value || "";
  let criteriaText = `${rowCrit} / ${colCrit}`.trim();
  criteriaText = criteriaText.replace(/^\s*\/\s*|\s*\/\s*$/g, "").toUpperCase();

  return (
    <div className="floating-overlay">
      <div className="floating-panel">
        {/* 🏷️ Criteria header */}
        {criteriaText && (
          <div className="floating-criteria-header">{criteriaText}</div>
        )}

        <div className="floating-panel-header">
          <h2>Make your guess</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="autocomplete-wrapper">
          {loading ? (
            <div className="loading">Loading Pokémon...</div>
          ) : (
            <Autocomplete
              namesList={options}
              onSelect={(name) => {
                onSelect(name);
                onClose();
              }}
              placeholder="Search Pokémon..."
              renderSelectButton={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
