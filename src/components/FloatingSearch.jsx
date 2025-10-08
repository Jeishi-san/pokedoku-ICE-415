import React from "react";
import Autocomplete from "./Autocomplete";
import "./FloatingSearch.css";   // <-- add this

export default function FloatingSearchPanel({ isOpen, onClose, onSelect, options }) {
  if (!isOpen) return null;

  return (
    <div className="floating-overlay">
      <div className="floating-panel">
        <div className="floating-panel-header">
          <h2>Make your guess</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="autocomplete-wrapper">
          <Autocomplete
            namesList={options}
            onSelect={(name) => {
              onSelect(name);
              onClose();
            }}
            placeholder="Search Pokémon..."
          />
        </div>
      </div>
    </div>
  );
}
