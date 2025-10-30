// ✅ pokedoku/src/utils/api.js - Fixed Pokémon API Client

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:3001";
const API = `${BASE_URL}/api/pokemon`;

/* -------------------------------------------------------------------------- */
/* 🧰 Safe Fetch Helper                                                       */
/* -------------------------------------------------------------------------- */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.headers.get("content-type")?.includes("application/json")
      ? await res.json()
      : null;
  } catch (err) {
    console.error(`❌ Fetch failed: ${url}`, err.message);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🌐 Backend Health Check                                                    */
/* -------------------------------------------------------------------------- */
export const pingBackend = async () => {
  try {
    const res = await safeFetch(`${BASE_URL}/`);
    console.log("✅ Backend:", res?.message || "OK");
    return res;
  } catch {
    console.warn("⚠️ Backend unreachable");
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* 🧠 Name Normalization (Simplified)                                         */
/* -------------------------------------------------------------------------- */
export const normalizeName = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/\s+/g, "-")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/[':.()]/g, "")
    .replace(/[^a-z0-9-]/g, "");

/* -------------------------------------------------------------------------- */
/* 🧠 Lazy Pokémon Name Caching (FIXED)                                      */
/* -------------------------------------------------------------------------- */
let cachedNames = null;
export async function fetchAllPokemonNamesLazy() {
  if (cachedNames?.length) return cachedNames;
  
  try {
    const data = await safeFetch(`${API}/all`);
    
    // Handle multiple possible response formats from backend
    let namesArray = null;
    
    if (Array.isArray(data)) {
      // Format 1: Direct array ["bulbasaur", "ivysaur"]
      namesArray = data;
    } else if (data && Array.isArray(data.pokemon)) {
      // Format 2: { pokemon: ["bulbasaur", "ivysaur"] }
      namesArray = data.pokemon;
    } else if (data && Array.isArray(data.names)) {
      // Format 3: { names: ["bulbasaur", "ivysaur"] }
      namesArray = data.names;
    } else if (data && Array.isArray(data.data)) {
      // Format 4: { data: ["bulbasaur", "ivysaur"] }
      namesArray = data.data;
    } else {
      throw new Error(`Invalid response format: ${typeof data}`);
    }
    
    // Process the names array
    if (!namesArray || !Array.isArray(namesArray)) {
      throw new Error("No valid names array found in response");
    }
    
    cachedNames = namesArray
      .map(p => (typeof p === "string" ? p : p?.name))
      .filter(name => name && typeof name === "string" && name.length > 0);
    
    console.log(`✅ Loaded ${cachedNames.length} Pokémon names from backend`);
    return cachedNames;
    
  } catch (err) {
    console.warn("⚠️ Backend failed, using REST fallback…", err.message);
    
    // Fallback to PokeAPI
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
      if (!res.ok) throw new Error(`PokeAPI ${res.status}`);
      
      const json = await res.json();
      cachedNames = json.results.map(p => p.name).filter(Boolean);
      console.log(`✅ Loaded ${cachedNames.length} Pokémon names from PokeAPI fallback`);
      return cachedNames;
    } catch (fallbackError) {
      console.error("❌ All data sources failed:", fallbackError);
      // Minimal fallback to prevent complete failure
      cachedNames = ["pikachu", "charizard", "bulbasaur", "squirtle", "eevee"];
      return cachedNames;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 🧬 Species & Pokémon Details (Simplified - No Sprite Logic)               */
/* -------------------------------------------------------------------------- */
export async function fetchSpeciesByName(name) {
  const n = normalizeName(name);
  if (!n) return createFallbackSpeciesData(name);

  try {
    const data = await safeFetch(`${API}/species/${encodeURIComponent(n)}`);
    
    // Handle different backend response formats for species
    const speciesData = data.species || data.data || data;
    
    return {
      name: speciesData.name || n,
      region: speciesData.region || "Unknown",
      evolution: speciesData.evolution || "Unknown",
      statuses: speciesData.statuses || ["Normal Pokémon"],
      generation: speciesData.generation || "Unknown",
      types: speciesData.types || [],
      // Backend now provides spriteUrl directly
      spriteUrl: speciesData.spriteUrl || null,
    };
  } catch {
    const poke = await fetchBasicPokemonData(n);
    return {
      name: poke?.name || n,
      region: "Unknown",
      evolution: "Unknown",
      statuses: ["Normal Pokémon"],
      generation: "Unknown",
      types: poke?.types?.map((t) => t.type?.name) || [],
      spriteUrl: null, // Let frontend handle sprite generation
    };
  }
}

export async function fetchPokemonDetails(name) {
  const n = normalizeName(name);
  if (!n) return null;

  const [species, poke] = await Promise.all([fetchSpeciesByName(n), fetchBasicPokemonData(n)]);
  return {
    name: n,
    // Use backend-provided spriteUrl or let frontend handle it
    spriteUrl: species.spriteUrl || null,
    types:
      species.types.length > 0
        ? species.types
        : poke?.types?.map((t) => t.type?.name) || [],
    ...species,
  };
}

/* -------------------------------------------------------------------------- */
/* 🧾 Basic REST Pokémon Fallback                                             */
/* -------------------------------------------------------------------------- */
async function fetchBasicPokemonData(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`REST ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* 🧱 Fallback Data Generator (Simplified)                                    */
/* -------------------------------------------------------------------------- */
const createFallbackSpeciesData = (name) => ({
  name: normalizeName(name) || "unknown",
  region: "Unknown",
  evolution: "Unknown",
  statuses: ["Normal Pokémon"],
  generation: "Unknown",
  types: [],
  spriteUrl: null, // No sprite logic here
});

/* -------------------------------------------------------------------------- */
/* 🔍 Backend Response Debugger (Optional - Add for troubleshooting)         */
/* -------------------------------------------------------------------------- */
export async function debugBackendResponse() {
  try {
    console.group("🔍 Backend Response Debug");
    console.log("📡 Testing endpoint:", `${API}/all`);
    
    const response = await fetch(`${API}/all`);
    console.log("📊 HTTP Status:", response.status);
    console.log("📊 Content-Type:", response.headers.get('content-type'));
    
    const text = await response.text();
    console.log("📊 Raw response (first 500 chars):", text.substring(0, 500));
    
    try {
      const json = JSON.parse(text);
      console.log("📊 Parsed JSON type:", Array.isArray(json) ? "Array" : typeof json);
      
      if (!Array.isArray(json)) {
        console.log("📊 Object keys:", Object.keys(json));
        // Check for common patterns
        if (json.pokemon && Array.isArray(json.pokemon)) {
          console.log("✅ Found 'pokemon' array with", json.pokemon.length, "items");
        }
        if (json.names && Array.isArray(json.names)) {
          console.log("✅ Found 'names' array with", json.names.length, "items");
        }
        if (json.data && Array.isArray(json.data)) {
          console.log("✅ Found 'data' array with", json.data.length, "items");
        }
      } else {
        console.log("✅ Backend returns direct array with", json.length, "items");
      }
    } catch (parseError) {
      console.error("❌ Response is not valid JSON");
    }
    
    console.groupEnd();
  } catch (error) {
    console.error("❌ Debug request failed:", error);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧠 Export Default                                                          */
/* -------------------------------------------------------------------------- */
export default {
  pingBackend,
  fetchAllPokemonNamesLazy,
  fetchSpeciesByName,
  fetchPokemonDetails,
  normalizeName,
  debugBackendResponse, // Optional: for troubleshooting
};