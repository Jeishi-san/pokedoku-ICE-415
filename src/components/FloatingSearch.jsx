// ✅ src/components/FloatingSearch.jsx — Fixed import
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Autocomplete from "./Autocomplete";
// FIXED: Import named exports directly from api.js
import { fetchAllPokemonNamesLazy } from "../utils/api";
import useDebounce from "../hooks/useDebounce";
import "./FloatingSearch.css";

export default function FloatingSearchPanel({
  isOpen,
  onClose,
  onSelect,
  position = null,
  maxResults = 50,
}) {
  const [allNames, setAllNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [input, setInput] = useState("");
  const [namesLoaded, setNamesLoaded] = useState(false);
  
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* 🧠 State Management & Focus                                                */
  /* -------------------------------------------------------------------------- */
  const resetState = useCallback(() => {
    setInput("");
    setSelectedIndex(-1);
    setError(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();
      // Focus after animation completes
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen, resetState]);

  /* -------------------------------------------------------------------------- */
  /* ⚡ Smart Pokémon Names Loading                                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen || namesLoaded) return;

    let active = true;
    
    const loadNames = async () => {
      try {
        setLoading(true);
        setError(null);
        // FIXED: Use named export directly
        const allNames = await fetchAllPokemonNamesLazy();
        
        if (active && Array.isArray(allNames)) {
          setAllNames(allNames);
          setNamesLoaded(true);
        }
      } catch (err) {
        console.error("❌ Failed to load Pokémon names:", err);
        if (active) {
          setError("Failed to load Pokémon database. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadNames();
    
    return () => { active = false; };
  }, [isOpen, namesLoaded]);

  /* -------------------------------------------------------------------------- */
  /* ✅ Selection & Close Handlers                                             */
  /* -------------------------------------------------------------------------- */
  const handleSelect = useCallback((name) => {
    if (!name) return;
    
    // Add slight delay for better UX feedback
    setTimeout(() => {
      onSelect(name);
      resetState();
      onClose();
    }, 50);
  }, [onSelect, onClose, resetState]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  /* -------------------------------------------------------------------------- */
  /* ⌨️ Enhanced Keyboard Navigation                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
          
        case "Tab":
          // Prevent tab from closing the panel unexpectedly
          e.preventDefault();
          break;
      }
    };

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, handleClose]);

  /* -------------------------------------------------------------------------- */
  /* 🎨 Smart Panel Positioning                                                */
  /* -------------------------------------------------------------------------- */
  const panelStyle = useMemo(() => {
    const baseStyle = {
      position: "fixed",
      zIndex: 10000,
    };

    if (position) {
      // Calculate safe position within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = 400; // Estimated panel width
      const panelHeight = 500; // Estimated panel height
      
      let left = position.x;
      let top = position.y;

      // Ensure panel stays within viewport bounds
      if (left + panelWidth > viewportWidth) {
        left = viewportWidth - panelWidth - 20;
      }
      if (top + panelHeight > viewportHeight) {
        top = viewportHeight - panelHeight - 20;
      }
      if (left < 20) left = 20;
      if (top < 20) top = 20;

      return {
        ...baseStyle,
        left: `${left}px`,
        top: `${top}px`,
      };
    }

    // Centered fallback
    return {
      ...baseStyle,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    };
  }, [position]);

  /* -------------------------------------------------------------------------- */
  /* 📊 Status & Debug Information                                            */
  /* -------------------------------------------------------------------------- */
  const statusMessage = useMemo(() => {
    if (error) {
      return (
        <div className="status-error" role="alert">
          ⚠️ {error}
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="status-loading" role="status">
          🔄 Loading Pokémon database...
        </div>
      );
    }
    
    if (!input && namesLoaded) {
      return (
        <div className="status-hint" role="status">
          💡 Type to search {allNames.length} Pokémon
        </div>
      );
    }
    
    return null;
  }, [loading, error, input, namesLoaded, allNames.length]);

  const debugInfo = useMemo(() => {
    if (import.meta.env.DEV) {
      return (
        <div className="debug-info" style={{ fontSize: '12px', opacity: 0.7 }}>
          Pokémon: {allNames.length} | Loaded: {namesLoaded.toString()}
        </div>
      );
    }
    return null;
  }, [allNames.length, namesLoaded]);

  if (!isOpen) return null;

  /* -------------------------------------------------------------------------- */
  /* 🧩 Render Component                                                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="floating-overlay" role="dialog" aria-modal="true">
      <div 
        ref={panelRef}
        className="floating-panel search-panel"
        style={panelStyle}
      >
        {/* Header */}
        <div className="floating-panel-header">
          <h2 className="search-title">
            <span className="pokeball-icon" aria-hidden="true">⚬</span>
            Search Pokémon
          </h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            aria-label="Close search panel"
          >
            ×
          </button>
        </div>

        {/* Search Input - Pass ALL names to Autocomplete for filtering */}
        <div className="autocomplete-wrapper">
          <Autocomplete
            namesList={allNames} // Pass complete list, let Autocomplete handle filtering
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            onHover={setSelectedIndex}
            inputValue={input}
            onInputChange={(e) => setInput(e.target.value)}
            onInputFocus={() => setSelectedIndex(-1)}
            inputRef={inputRef}
            placeholder="Type to search Pokémon..."
            maxSuggestions={maxResults}
          />
        </div>

        {/* Status Messages */}
        <div className="search-status">
          {statusMessage}
        </div>

        {/* Debug Info */}
        {debugInfo}

        {/* Keyboard Tips */}
        <div className="search-tips" role="complementary">
          {[
            ["↑↓", "Navigate suggestions"],
            ["Enter", "Select Pokémon"],
            ["Esc", "Close search"],
          ].map(([key, label]) => (
            <div key={key} className="tip-item">
              <kbd aria-label={`Key: ${key}`}>{key}</kbd>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}