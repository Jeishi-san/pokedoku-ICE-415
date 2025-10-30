// ✅ src/components/Autocomplete.jsx — Fixed (no normalizeName import)
import React, { useEffect, useState, useMemo, useCallback } from "react";
import useDebounce from "../hooks/useDebounce";
import { getPokemonSpriteUrl, getPokemonDBSpriteName } from "../utils/spriteUtils";

// Local normalizeName function (same as in spriteUtils)
function normalizeName(name = "") {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/\s+/g, "-")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/[':.()]/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

export default function Autocomplete({
  namesList = [],
  onSelect,
  selectedIndex = -1,
  onHover,
  inputValue = "",
  onInputChange,
  onInputFocus,
  inputRef,
  placeholder = "Type a Pokémon...",
  maxSuggestions = 25,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [localInput, setLocalInput] = useState(inputValue);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedInput = useDebounce(localInput, 200);

  // Sync local input with parent value
  useEffect(() => {
    setLocalInput(inputValue);
  }, [inputValue]);

  // --------------------------------------------------------------------------
  // 🔍 Filter suggestions with sprite URLs (Fixed Sprite Display)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!debouncedInput.trim() || !namesList.length) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const filterAndMapSuggestions = () => {
      setIsLoading(true);
      const searchTerm = debouncedInput.toLowerCase().trim();
      
      try {
        // Handle both string array and object array formats from API
        const searchList = namesList.map(item => {
          if (typeof item === 'string') {
            return { display: item, searchKey: normalizeName(item) };
          }
          return {
            display: item.display || item.name || String(item),
            searchKey: item.searchKey || normalizeName(item.display || item.name || String(item))
          };
        }).filter(item => item.display && item.searchKey);

        // Enhanced filtering with multiple matching strategies
        const filtered = searchList
          .filter(({ display, searchKey }) => {
            const displayLower = display.toLowerCase();
            const searchKeyLower = searchKey.toLowerCase();
            const searchNormalized = searchTerm.toLowerCase();
            
            // Multiple matching strategies
            return (
              displayLower.includes(searchNormalized) ||
              searchKeyLower.includes(searchNormalized) ||
              displayLower.replace(/[^a-z0-9]/g, '').includes(searchNormalized.replace(/[^a-z0-9]/g, '')) ||
              displayLower.startsWith(searchNormalized) ||
              searchKeyLower.startsWith(searchNormalized)
            );
          })
          .slice(0, maxSuggestions);

        // Generate sprite URLs - CRITICAL: Use display name for sprites
        const allSuggestions = filtered.map(({ display, searchKey }) => {
          const spriteUrl = getPokemonSpriteUrl(display);
          const spriteName = getPokemonDBSpriteName(display);
          
          return {
            name: display, // Pass original name to onSelect
            displayName: display, // For display in UI
            searchKey: searchKey, // For searching
            spriteName: spriteName, // For debugging
            spriteUrl: spriteUrl // For display
          };
        });

        // Enhanced debugging with direct sprite testing
        if (import.meta.env.DEV && allSuggestions.length > 0) {
          console.group(`🔍 Autocomplete Results for "${debouncedInput}"`);
          console.log(`Found ${allSuggestions.length} matches`);
          
          // Test sprite URLs for all suggestions
          allSuggestions.forEach((suggestion, index) => {
            const img = new Image();
            img.onload = () => {
              console.log(`✅ ${index + 1}. ${suggestion.displayName} → ${suggestion.spriteUrl}`);
            };
            img.onerror = () => {
              console.error(`❌ ${index + 1}. ${suggestion.displayName} → ${suggestion.spriteUrl}`);
              console.log('   Details:', {
                display: suggestion.displayName,
                searchKey: suggestion.searchKey,
                spriteName: suggestion.spriteName,
                generatedUrl: suggestion.spriteUrl
              });
            };
            img.src = suggestion.spriteUrl;
          });
          
          console.groupEnd();
        }

        setSuggestions(allSuggestions);
      } catch (error) {
        console.error("Error generating suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    filterAndMapSuggestions();
  }, [debouncedInput, namesList, maxSuggestions]);

  // --------------------------------------------------------------------------
  // 🖱️ Handlers
  // --------------------------------------------------------------------------
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setLocalInput(value);
    onInputChange?.(e);
  }, [onInputChange]);

  const handleSelect = useCallback((pokemon) => {
    setLocalInput("");
    setSuggestions([]);
    onSelect?.(pokemon.name);
  }, [onSelect]);

  const handleMouseEnter = useCallback((index) => {
    onHover?.(index);
  }, [onHover]);

  const handleImageError = useCallback((e) => {
    const target = e.target;
    if (!target.dataset.fallback) {
      const pokemonName = target.dataset.pokemon || 'unknown';
      console.error(`🖼️ Sprite failed to load for: ${pokemonName}`, {
        src: target.src,
        expectedSprite: getPokemonDBSpriteName(pokemonName)
      });
      
      target.src = "https://img.pokemondb.net/sprites/home/normal/missingno.png";
      target.dataset.fallback = "true";
      target.style.opacity = "0.7";
      target.alt = "Sprite not available";
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        break;
      case 'ArrowDown':
        if (suggestions.length > 0) {
          e.preventDefault();
          onHover?.(selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0);
        }
        break;
      case 'ArrowUp':
        if (suggestions.length > 0) {
          e.preventDefault();
          onHover?.(selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1);
        }
        break;
    }
  }, [selectedIndex, suggestions, handleSelect, onHover]);

  // --------------------------------------------------------------------------
  // 🎯 Memoized values
  // --------------------------------------------------------------------------
  const hasSuggestions = useMemo(() => suggestions.length > 0, [suggestions]);
  const showLoadingState = useMemo(() => isLoading && debouncedInput.trim(), [isLoading, debouncedInput]);

  // --------------------------------------------------------------------------
  // 🧩 Render
  // --------------------------------------------------------------------------
  return (
    <div className="autocomplete-wrapper" style={{ position: "relative", zIndex: 10002 }}>
      <div className="autocomplete">
        <input
          ref={inputRef}
          value={localInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
          placeholder={placeholder}
          className="autocomplete-input"
          autoFocus
          aria-label="Search Pokémon"
          role="combobox"
          aria-expanded={hasSuggestions}
          aria-controls="pokemon-suggestion-list"
          aria-autocomplete="list"
          aria-activedescendant={
            selectedIndex >= 0 && suggestions[selectedIndex] 
              ? `suggestion-${selectedIndex}` 
              : undefined
          }
        />
        
        {/* Loading indicator */}
        {showLoadingState && (
          <div className="suggestions-loading" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            <span>Loading suggestions...</span>
          </div>
        )}

        {/* Suggestions list */}
        {hasSuggestions && (
          <ul 
            id="pokemon-suggestion-list"
            className="suggestions" 
            role="listbox"
            style={{ zIndex: 10005 }}
          >
            {suggestions.map((pokemon, index) => (
              <li
                key={`${pokemon.searchKey}-${index}`}
                id={`suggestion-${index}`}
                className={`suggestion-item ${selectedIndex === index ? "suggestion-active" : ""}`}
                onClick={() => handleSelect(pokemon)}
                onMouseEnter={() => handleMouseEnter(index)}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <img
                  src={pokemon.spriteUrl}
                  alt={`${pokemon.displayName} sprite`}
                  onError={handleImageError}
                  className="suggestion-img"
                  loading="lazy"
                  width="40"
                  height="40"
                  data-pokemon={pokemon.displayName}
                />
                <span className="suggestion-name">{pokemon.displayName}</span>
              </li>
            ))}
          </ul>
        )}

        {/* No results state */}
        {debouncedInput.trim() && !hasSuggestions && !isLoading && (
          <div className="suggestions-empty" role="status">
            <span>No Pokémon found for "{debouncedInput}"</span>
          </div>
        )}
      </div>
    </div>
  );
}