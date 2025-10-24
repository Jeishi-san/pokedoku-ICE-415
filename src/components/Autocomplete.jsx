// src/components/Autocomplete.jsx
import React, { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";

export default function Autocomplete({
  namesList = [],
  onSelect,
  placeholder = "Type a Pokémon...",
  renderSelectButton = false,
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounced = useDebounce(input, 200);

  // 🔍 Filter suggestions on input
  useEffect(() => {
    if (!debounced || namesList.length === 0) {
      setSuggestions([]);
      return;
    }

    const q = debounced.toLowerCase();

    const matches = namesList
      .filter((p) =>
        (typeof p === "string" ? p : p.name).toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map((p) => (typeof p === "string" ? { name: p, image: null } : p));

    setSuggestions(matches);
  }, [debounced, namesList]);

  // ✅ Handle selection
  const handleSelect = (p) => {
    setInput("");
    onSelect(p.name);
  };

  return (
    <div className="autocomplete">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="autocomplete-input"
      />

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((p) => (
            <li key={p.name} className="suggestion-item">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="suggestion-img"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="suggestion-placeholder" />
              )}
              <span className="suggestion-name">{p.name}</span>

              {renderSelectButton ? (
                <button className="select-btn" onClick={() => handleSelect(p)}>
                  Select
                </button>
              ) : (
                <span
                  onClick={() => handleSelect(p)}
                  className="click-overlay"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
