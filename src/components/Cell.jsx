// ✅ src/components/Cell.jsx - Updated for Simplified Sprite Architecture
import React from "react";
import { getPokemonSpriteUrl } from "../utils/spriteUtils";
import "./PuzzleGrid.css";

export default function Cell({ rIdx, cIdx, value, onClick, status = "", style = {} }) {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    onClick(rIdx, cIdx);
  };

  const handleImageError = (e) => {
    // Fallback for broken images
    const img = e.target;
    img.style.display = 'none';
    
    // Show placeholder
    const placeholder = img.nextSibling;
    if (placeholder && placeholder.style) {
      placeholder.style.display = 'block';
    }
  };

  const handleImageLoad = (e) => {
    // Hide placeholder when image loads successfully
    const img = e.target;
    const placeholder = img.nextSibling;
    if (placeholder && placeholder.style) {
      placeholder.style.display = 'none';
    }
  };

  // Generate sprite URL directly using spriteUtils
  const spriteUrl = value && value.name ? getPokemonSpriteUrl(value.name) : null;

  return (
    <div
      className={`cell ${status} ${value ? "filled" : "empty"}`}
      onClick={handleClick}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={value ? `${value.name} - ${status}` : "Empty cell - Click to select Pokémon"}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
      data-row={rIdx}
      data-col={cIdx}
      data-testid={`cell-${rIdx}-${cIdx}`}
    >
      {value && value.name ? (
        <div className="entry">
          <div className="image-container">
            {/* Use generated sprite URL instead of value.image */}
            <img
              src={spriteUrl}
              alt={value.name}
              className="pokemon-img"
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            <div className="pokemon-placeholder" style={{ display: 'none' }}>
              ❓
            </div>
          </div>
          <div className="name" title={value.name}>
            {value.name}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          {/* Empty cell state */}
        </div>
      )}
      
      {/* Status indicator overlay */}
      {status === 'loading' && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="error-overlay">⚠️</div>
      )}
    </div>
  );
}