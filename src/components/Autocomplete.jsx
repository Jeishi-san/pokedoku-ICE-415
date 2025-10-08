// src/components/Autocomplete.jsx
import React, { useState, useEffect } from "react";
import useDebounce from "../hooks/useDebounce";

export default function Autocomplete({
  namesList,
  onSelect,
  placeholder = "Type a Pokémon...",
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounced = useDebounce(input, 200);

  // 🔎 Filter Pokémon as user types
  useEffect(() => {
    if (!debounced) {
      setSuggestions([]);
      return;
    }

    const q = debounced.toLowerCase();

    // ✅ Allow both ["bulbasaur", "charmander"] or [{name, image}]
    const matches = namesList
      .filter((p) =>
        (typeof p === "string" ? p : p.name).toLowerCase().startsWith(q)
      )
      .slice(0, 8) // limit results
      .map((p) => (typeof p === "string" ? { name: p, image: null } : p));

    setSuggestions(matches);
  }, [debounced, namesList]);

  return (
    <div className="autocomplete relative w-full">
      {/* 🔑 Search Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
      />

      {/* 🔥 Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((p) => (
            <li
              key={p.name}
              onClick={() => {
                onSelect(p.name);
                setInput(""); // clear after selection
                setSuggestions([]); // close dropdown
              }}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="capitalize">{p.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
