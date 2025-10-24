// src/components/Cell.jsx
import React from "react";
import "./PuzzleGrid.css";

export default function Cell({ rIdx, cIdx, value, onClick, status = "", style = {} }) {
  const handleClick = () => onClick(rIdx, cIdx);

  return (
    <div
      className={`cell ${status} ${value ? "filled" : "empty"}`}
      onClick={handleClick}
      style={style}
      title={value ? value.name : "Click to select Pokémon"}
    >
      {value && value.name ? (
        <div className="entry">
          {value.image ? (
            <img
              src={value.image}
              alt={value.name}
              className="pokemon-img"
            />
          ) : (
            <div className="pokemon-placeholder">❓</div>
          )}
          <div className="name">{value.name}</div>
        </div>
      ) : (
        <span className="placeholder">?</span>
      )}
    </div>
  );
}
