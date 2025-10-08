// src/components/Cell.jsx
import React from "react";

export default function Cell({ rIdx, cIdx, value, onClick, status, style }) {
  const handleClick = () => {
    if (onClick) onClick(rIdx, cIdx);
  };

  return (
    <div
      className={`cell ${status || "empty"}`}
      onClick={handleClick}
      style={{
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background:
          status === "valid"
            ? "#d4f7d4" // ✅ Green for correct
            : status === "invalid"
            ? "#f8d7da" // ❌ Red for wrong
            : "#fff",   // Empty cell
        ...style,
      }}
    >
      {value ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            maxWidth: "70px",
          }}
        >
          <img
            src={value.image}
            alt={value.name}
            width={48}
            height={48}
            style={{
              display: "block",
              margin: "0 auto 4px",
            }}
            className="pokemon-img"
          />
          <div className="name">{value.name}</div>
        </div>
      ) : (
        <span
          className="placeholder"
          style={{
            fontSize: "1.5rem",
            color: "#999",
          }}
        >
          ?
        </span>
      )}
    </div>
  );
}
