import React from "react";

export default function Cell({ rIdx, cIdx, value, onClick, status, style }) {
  const handleClick = () => onClick(rIdx, cIdx);

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
        background: status === "valid" ? "#d4f7d4" : "#fff",
        ...style,
      }}
    >
      <div className="entry">
        {value ? (
          <>
            <img
              src={value.image}
              alt={value.name}
              width={48}
              height={48}
              className="pokemon-img"
            />
            <div className="name">{value.name}</div>
          </>
        ) : (
          <span className="placeholder">?</span>
        )}
      </div>
    </div>
  );
}
