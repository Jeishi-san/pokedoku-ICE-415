// src/utils/pokemonCache.js

/**
 * ✅ In-memory + persistent cache for Pokémon data.
 * Uses localStorage for persistence between reloads.
 */
const cache = {
  names: null,           // Array<{ name, image, url }>
  details: {},           // Pokémon details keyed by lowercase name
  species: {},           // Species details keyed by species URL
};

/** Normalize Pokémon name for consistent key storage */
function normalizeName(name) {
  return name?.toLowerCase()?.trim() || "";
}

/** Save cache to localStorage (for persistence) */
function saveCache() {
  try {
    localStorage.setItem("pokemonCache", JSON.stringify(cache));
  } catch (err) {
    console.warn("⚠️ Failed to save Pokémon cache:", err);
  }
}

/** Load cache from localStorage on startup */
(function loadCache() {
  try {
    const stored = localStorage.getItem("pokemonCache");
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.assign(cache, parsed);
      console.log("✅ Pokémon cache loaded from localStorage");
    }
  } catch (err) {
    console.warn("⚠️ Failed to load Pokémon cache:", err);
  }
})();

/* ---------------------- 🗃️ NAME CACHE ---------------------- */

/** Cache the list of all Pokémon names */
export function cacheNames(list) {
  if (!Array.isArray(list)) return;
  cache.names = list;
  saveCache();
}

/** Get cached Pokémon names */
export function getNames() {
  return cache.names || [];
}

/* -------------------- 🔍 DETAILS CACHE -------------------- */

/** Cache detailed Pokémon info */
export function cacheDetails(name, data) {
  const key = normalizeName(name);
  if (!key || !data) return;
  cache.details[key] = data;
  saveCache();
}

/** Retrieve cached Pokémon details by name */
export function getDetails(name) {
  const key = normalizeName(name);
  return cache.details[key] || null;
}

/* -------------------- 🧬 SPECIES CACHE -------------------- */

/** Cache species data fetched from REST URL */
export function cacheSpecies(url, data) {
  if (!url || !data) return;
  cache.species[url] = data;
  saveCache();
}

/** Retrieve cached species data by URL */
export function getSpecies(url) {
  if (!url) return null;
  return cache.species[url] || null;
}

/* ---------------------- ⚙️ UTILITIES ---------------------- */

/** Clear all cached Pokémon data */
export function clearCache() {
  cache.names = null;
  cache.details = {};
  cache.species = {};
  localStorage.removeItem("pokemonCache");
  console.log("🧹 Pokémon cache cleared");
}
