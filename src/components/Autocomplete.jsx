// src/components/Autocomplete.jsx
import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce"; // ✅ fixed filename

export default function Autocomplete({ namesList, onSelect, placeholder = "Type a Pokémon..." }) {
  const [input, setInput] = useState("");
  const debounced = useDebounce(input, 200);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!debounced) {
      setSuggestions([]);
      return;
    }
    const q = debounced.toLowerCase();

    // ✅ Support both strings & objects
    const matches = namesList
      .filter((p) =>
        (typeof p === "string" ? p : p.name).toLowerCase().startsWith(q)
      )
      .slice(0, 8)
      .map((p) => (typeof p === "string" ? { name: p, image: null } : p));

    setSuggestions(matches);
  }, [debounced, namesList]);

  return (
    <div className="autocomplete">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((p) => (
            <li
              key={p.name}
              onClick={() => {
                setInput("");
                onSelect(p.name);
              }}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  width={36}
                  style={{ verticalAlign: "middle" }}
                />
              )}
              <span style={{ marginLeft: 8 }}>{p.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
