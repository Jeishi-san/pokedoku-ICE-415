// ✅ src/utils/PokemonCache.js — Optimized Hybrid Version
/**
 * Pokémon Data Cache for PokéDoku
 * - Keeps names, details, species, and evolutions in memory + localStorage
 * - Auto-loads & persists
 * - Lightweight, reliable, and fast
 */

const hasLocalStorage = typeof window !== "undefined" && typeof localStorage !== "undefined";

const cache = {
  names: null,
  details: {},     // { [name]: { sprites, stats, etc. } }
  species: {},     // { [name]: { region, types, generation, ... } }
  evolutions: {}   // { [name]: evolutionData }
};

/* -------------------------------------------------------------------------- */
/* 🧩 Helpers                                                                 */
/* -------------------------------------------------------------------------- */
const normalize = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const safeSet = (key, obj, value) => (key && value && (obj[key] = value));
const safeGet = (key, obj) => (key ? obj[key] || null : null);

function persist() {
  if (!hasLocalStorage) return;
  try {
    localStorage.setItem("pokemonCache", JSON.stringify(cache));
  } catch (err) {
    console.warn("⚠️ Failed to save cache:", err);
  }
}

function load() {
  if (!hasLocalStorage) return;
  try {
    const data = localStorage.getItem("pokemonCache");
    if (data) Object.assign(cache, JSON.parse(data));
  } catch (err) {
    console.warn("⚠️ Failed to load cache:", err);
  }
}
load();

/* -------------------------------------------------------------------------- */
/* 🔤 Name Cache                                                              */
/* -------------------------------------------------------------------------- */
export const cacheNames = (list) => {
  if (Array.isArray(list) && list.length) {
    cache.names = list;
    persist();
  }
};
export const getNames = () => cache.names || [];

/* -------------------------------------------------------------------------- */
/* 🧱 Pokémon Details Cache                                                   */
/* -------------------------------------------------------------------------- */
export const cacheDetails = (name, data) => {
  const key = normalize(name);
  if (typeof data === "object") safeSet(key, cache.details, data);
  persist();
};
export const getDetails = (name) => safeGet(normalize(name), cache.details);

/* -------------------------------------------------------------------------- */
/* 🧬 Species Cache (Core for PokéDoku)                                       */
/* -------------------------------------------------------------------------- */
export const cacheSpeciesByName = (name, data) => {
  const key = normalize(name);
  if (!data || typeof data !== "object") return;

  safeSet(key, cache.species, {
    name: data.name || key,
    region: data.region || "Unknown",
    generation: data.generation || "Unknown",
    evolution: data.evolution || "Unknown",
    types: Array.isArray(data.types) ? data.types : [],
    statuses: Array.isArray(data.statuses) ? data.statuses : ["Normal Pokémon"]
  });

  persist();
};
export const getSpeciesByName = (name) => safeGet(normalize(name), cache.species);

// Legacy URL-based fallback
export const cacheSpecies = (url, data) => typeof url === "string" && data && (cache.species[url] = data, persist());
export const getSpecies = (url) => safeGet(url, cache.species);

/* -------------------------------------------------------------------------- */
/* 🔄 Combined Cache Helpers                                                  */
/* -------------------------------------------------------------------------- */
export const cachePokemonData = (name, speciesData) => {
  cacheSpeciesByName(name, speciesData);
};
export const getPokemonData = (name) => {
  const key = normalize(name);
  return {
    details: getDetails(key),
    species: getSpeciesByName(key),
    hasData: !!(cache.details[key] || cache.species[key])
  };
};

/* -------------------------------------------------------------------------- */
/* 🧹 Maintenance + Debug                                                     */
/* -------------------------------------------------------------------------- */
export const clearCache = () => {
  Object.assign(cache, { names: null, details: {}, species: {}, evolutions: {} });
  if (hasLocalStorage) localStorage.removeItem("pokemonCache");
  console.log("🧹 Pokémon cache cleared");
};

export const cacheStats = () => ({
  names: cache.names?.length || 0,
  details: Object.keys(cache.details).length,
  species: Object.keys(cache.species).length,
  evolutions: Object.keys(cache.evolutions).length
});

export const debugCache = () => console.table(cacheStats());

if (typeof window !== "undefined") {
  window.pokemonCacheDebug = {
    cacheStats,
    debugCache,
    clearCache,
    getStats: () => ({
      names: cache.names?.length || 0,
      species: Object.keys(cache.species).length,
      sampleSpecies: Object.keys(cache.species).slice(0, 3)
    })
  };
}

console.log("✅ PokémonCache initialized:", cacheStats());
