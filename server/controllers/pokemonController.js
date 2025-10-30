// ✅ server/controllers/pokemonController.js (With Server-Side Validation + Sprite URL Support)
import { fetchSpeciesData, validatePokemonLogic } from "../services/pokemonService.js";
import { graphqlFetch, fetchWithTimeout } from "../utils/apiClient.js";
import { normalizeVariantName, getPokemonSpriteUrl } from "../utils/nameUtils.js";
import { handleSpecialForms } from "../utils/specialForms.js";
import {
  analyzeEvolutionChain,
  countChainSpecies,
  getChainDepth,
  simplifyChainForDebug,
} from "../utils/evolutionUtils.js";

const REST_BASE = "https://pokeapi.co/api/v2/";

/* -------------------------------------------------------------------------- */
/* 🔒 SAFE CACHE IMPLEMENTATION                                              */
/* -------------------------------------------------------------------------- */
class SafeCache {
  constructor(maxSize = 1000, ttl = 15 * 60 * 1000) { // 15 minutes TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.clear();
  }

  clear() {
    this.pokemonNames = null;
    this.speciesData = new Map();
    this.evolutionData = new Map();
    this.timestamps = new Map();
  }

  set(key, value, namespace = 'speciesData') {
    if (this[namespace].size >= this.maxSize) {
      this.cleanup();
    }
    this[namespace].set(key, value);
    this.timestamps.set(`${namespace}.${key}`, Date.now());
  }

  get(key, namespace = 'speciesData') {
    const timestamp = this.timestamps.get(`${namespace}.${key}`);
    if (timestamp && Date.now() - timestamp > this.ttl) {
      this[namespace].delete(key);
      this.timestamps.delete(`${namespace}.${key}`);
      return null;
    }
    return this[namespace].get(key);
  }

  has(key, namespace = 'speciesData') {
    const timestamp = this.timestamps.get(`${namespace}.${key}`);
    if (timestamp && Date.now() - timestamp > this.ttl) {
      this[namespace].delete(key);
      this.timestamps.delete(`${namespace}.${key}`);
      return false;
    }
    return this[namespace].has(key);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps) {
      if (now - timestamp > this.ttl) {
        const [namespace, actualKey] = key.split('.');
        this[namespace]?.delete(actualKey);
        this.timestamps.delete(key);
      }
    }
  }

  getStats() {
    return {
      speciesData: this.speciesData.size,
      evolutionData: this.evolutionData.size,
      pokemonNames: this.pokemonNames ? this.pokemonNames.length : 0,
      totalEntries: this.timestamps.size
    };
  }
}

const cache = new SafeCache();

/* -------------------------------------------------------------------------- */
/* 🛠️ ENVIRONMENT-AWARE LOGGING                                               */
/* -------------------------------------------------------------------------- */
const log = (...args) => {
  if (process.env.NODE_ENV !== "production") console.log(...args);
};

/* -------------------------------------------------------------------------- */
/* 🛡️ INPUT VALIDATION                                                        */
/* -------------------------------------------------------------------------- */
function validatePokemonName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid Pokémon name');
  }
  
  const cleanName = name.trim().toLowerCase();
  if (cleanName.length === 0 || cleanName.length > 50) {
    throw new Error('Pokémon name must be between 1 and 50 characters');
  }
  
  // Basic sanitization - allow letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(cleanName)) {
    throw new Error('Invalid characters in Pokémon name');
  }
  
  return cleanName;
}

function validatePokemonId(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId < 1 || numId > 2000) {
    throw new Error('Pokémon ID must be a number between 1 and 2000');
  }
  return numId;
}

/* -------------------------------------------------------------------------- */
/* ⚡ SHARED GRAPHQL + REST FALLBACK HELPER                                     */
/* -------------------------------------------------------------------------- */
async function fetchWithFallback({ graphqlQuery, graphqlVars, restUrl, transform }) {
  try {
    const data = await graphqlFetch(graphqlQuery, graphqlVars);
    if (!data) throw new Error("No GraphQL data");
    return transform(data);
  } catch (err) {
    log("⚠️ GraphQL failed, falling back to REST:", err.message);
    const res = await fetchWithTimeout(restUrl);
    if (!res.ok) throw new Error(`REST fetch failed: ${res.status}`);
    const json = await res.json();
    return transform(json);
  }
}

/* -------------------------------------------------------------------------- */
/* 🎯 POKÉDOKU SERVER-SIDE VALIDATION                                         */
/* -------------------------------------------------------------------------- */
export async function validatePokemonCriteria(req, res) {
  try {
    const { name, rowCriterion, colCriterion } = req.body;
    
    if (!name || !rowCriterion || !colCriterion) {
      return res.status(400).json({ 
        error: "Missing required parameters: name, rowCriterion, colCriterion" 
      });
    }

    const cleanName = validatePokemonName(name);
    
    log(`🔍 Validating ${cleanName} for row:${rowCriterion.type} col:${colCriterion.type}`);
    
    const isValid = await validatePokemonLogic(cleanName, rowCriterion, colCriterion);
    
    res.json({ 
      isValid,
      pokemon: cleanName,
      rowCriterion: rowCriterion.type,
      colCriterion: colCriterion.type,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("❌ Validation Error:", err);
    
    if (err.message.includes('Invalid') || err.message.includes('must be')) {
      return res.status(400).json({ 
        error: `Invalid request: ${err.message}` 
      });
    }
    
    res.status(500).json({ 
      error: "Pokémon validation failed",
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🎯 FETCH ALL POKÉMON NAMES                                                  */
/* -------------------------------------------------------------------------- */
export async function getAllPokemonNames(req, res) {
  try {
    if (cache.pokemonNames) {
      return res.json({ status: "success", data: cache.pokemonNames });
    }

    const query = `
      query GetAllPokemon {
        pokemon_v2_pokemon(limit: 2000) { name }
      }
    `;

    const names = await fetchWithFallback({
      graphqlQuery: query,
      restUrl: `${REST_BASE}pokemon?limit=2000`,
      transform: (data) => {
        const results = data?.pokemon_v2_pokemon || data?.results || [];
        return results.map((p) => {
          const name = p.name || p.name;
          const special = handleSpecialForms(name, { name });
          return {
            name,
            displayName: special.displayName,
            spriteKey: special.spriteKey || name.toLowerCase(),
            // ✅ ADD spriteUrl to name list for frontend use
            spriteUrl: getPokemonSpriteUrl(name),
          };
        });
      },
    });

    cache.pokemonNames = names;
    log(`✅ Loaded ${names.length} Pokémon names`);
    res.json({ status: "success", data: names });
  } catch (err) {
    console.error("❌ getAllPokemonNames error:", err.message);
    res.status(500).json({ 
      status: "error", 
      error: "Failed to fetch Pokémon names",
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧬 GET POKÉMON BY NAME                                                      */
/* -------------------------------------------------------------------------- */
export async function getPokemonSpecies(req, res) {
  try {
    const name = validatePokemonName(req.params.name);
    
    // Check cache first
    const cachedData = cache.get(name, 'speciesData');
    if (cachedData) {
      return res.json({ status: "success", data: cachedData });
    }

    let speciesData = await fetchSpeciesData(name, "API");
    speciesData = handleSpecialForms(name, speciesData);

    // Fetch evolution summary with caching
    let evolutionSummary = "Unknown";
    if (speciesData?.evolution_chain?.url) {
      const evoUrl = speciesData.evolution_chain.url;
      const cachedEvo = cache.get(name, 'evolutionData');
      if (cachedEvo) {
        evolutionSummary = cachedEvo.stage || "Unknown";
      } else {
        try {
          const evoRes = await fetchWithTimeout(evoUrl);
          if (evoRes.ok) {
            const evoData = await evoRes.json();
            const analysis = analyzeEvolutionChain(evoData.chain, name);
            evolutionSummary = analysis.stage || "Unknown";
            cache.set(name, { ...analysis }, 'evolutionData');
          }
        } catch (error) {
          log(`Evolution fetch failed for ${name}:`, error.message);
          evolutionSummary = "Unknown";
        }
      }
    }

    // ✅ ADD spriteUrl to the payload
    const payload = {
      ...speciesData,
      evolution_chain_summary: evolutionSummary,
      spriteKey: speciesData.spriteKey || name,
      spriteUrl: getPokemonSpriteUrl(name), // Add direct sprite URL
      cached: false, // Indicate this is fresh data
    };

    cache.set(name, payload, 'speciesData');
    res.json({ status: "success", data: payload });
  } catch (err) {
    console.error(`❌ getPokemonSpecies(${req.params.name}) error:`, err.message);
    
    if (err.message.includes('Invalid') || err.message.includes('must be')) {
      return res.status(400).json({ 
        status: "error", 
        error: `Invalid request: ${err.message}` 
      });
    }
    
    res.status(500).json({ 
      status: "error", 
      error: `Failed to process ${req.params.name}`,
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🆔 GET POKÉMON BY ID                                                        */
/* -------------------------------------------------------------------------- */
export async function getPokemonById(req, res) {
  try {
    const id = validatePokemonId(req.params.id);

    const query = `
      query GetPokemonById($id: Int!) {
        pokemon_v2_pokemon_by_pk(id: $id) {
          name
          pokemon_v2_pokemonspecy { name }
        }
      }
    `;

    const speciesName = await fetchWithFallback({
      graphqlQuery: query,
      graphqlVars: { id },
      restUrl: `${REST_BASE}pokemon/${id}`,
      transform: (data) => {
        return (
          data?.pokemon_v2_pokemon_by_pk?.pokemon_v2_pokemonspecy?.name ||
          data?.pokemon_v2_pokemon_by_pk?.name ||
          data?.name ||
          null
        );
      },
    });

    if (!speciesName) {
      return res.status(404).json({ 
        status: "error", 
        error: `Pokémon ID ${id} not found` 
      });
    }

    // Check cache for species data
    let speciesData = cache.get(speciesName, 'speciesData');
    if (!speciesData) {
      speciesData = await fetchSpeciesData(speciesName, "ID_LOOKUP");
      speciesData = handleSpecialForms(speciesName, speciesData);
      
      // ✅ ADD spriteUrl when caching new data
      cache.set(speciesName, {
        ...speciesData,
        spriteUrl: getPokemonSpriteUrl(speciesName), // Add sprite URL
      }, 'speciesData');
    }

    res.json({ status: "success", data: speciesData });
  } catch (err) {
    console.error(`❌ getPokemonById(${req.params.id}) error:`, err.message);
    
    if (err.message.includes('Invalid') || err.message.includes('must be')) {
      return res.status(400).json({ 
        status: "error", 
        error: `Invalid request: ${err.message}` 
      });
    }
    
    res.status(500).json({ 
      status: "error", 
      error: `Failed to process Pokémon ID ${req.params.id}`,
      ...(process.env.NODE_ENV === 'development' && { debug: err.message })
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧪 TEST ROUTES                                                             */
/* -------------------------------------------------------------------------- */
export async function testPokemon(req, res) {
  try {
    const name = validatePokemonName(req.params.name);
    const data = await fetchSpeciesData(name, "TEST");
    const enhanced = handleSpecialForms(name, data);
    
    // ✅ ADD spriteUrl to test response
    res.json({ 
      status: "success", 
      data: { 
        pokemon: name, 
        details: enhanced, 
        spriteUrl: getPokemonSpriteUrl(name), // Add sprite URL
        timestamp: new Date(),
        cacheStats: cache.getStats()
      } 
    });
  } catch (err) {
    res.status(500).json({ 
      status: "error", 
      data: { 
        pokemon: req.params.name, 
        error: err.message, 
        timestamp: new Date() 
      } 
    });
  }
}

export async function bulkTestPokemon(req, res) {
  const testList = ["pikachu", "charizard", "eevee", "mewtwo", "lucario", "garchomp", "greninja", "sylveon"];
  const results = [];

  for (const name of testList) {
    try {
      const data = await fetchSpeciesData(name, "BULK_TEST");
      const enhanced = handleSpecialForms(name, data);
      
      // ✅ ADD spriteUrl to bulk test results
      results.push({ 
        name, 
        status: "success", 
        details: enhanced,
        spriteUrl: getPokemonSpriteUrl(name) // Add sprite URL
      });
    } catch (err) {
      results.push({ name, status: "error", error: err.message });
    }
  }

  res.json({
    status: "success",
    data: {
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "error").length,
      },
      cacheStats: cache.getStats(),
      timestamp: new Date(),
    },
  });
}

/* -------------------------------------------------------------------------- */
/* 🧬 EVOLUTION DEBUG ROUTE                                                    */
/* -------------------------------------------------------------------------- */
export async function debugEvolution(req, res) {
  try {
    const name = validatePokemonName(req.params.name);
    const normalizedName = normalizeVariantName(name);

    if (!cache.has(normalizedName, 'speciesData')) {
      const speciesData = await fetchSpeciesData(normalizedName, "DEBUG_CHAIN");
      const enhancedData = handleSpecialForms(normalizedName, speciesData);
      
      // ✅ ADD spriteUrl when caching new data
      cache.set(normalizedName, {
        ...enhancedData,
        spriteUrl: getPokemonSpriteUrl(normalizedName), // Add sprite URL
      }, 'speciesData');
    }

    const enhanced = cache.get(normalizedName, 'speciesData');

    if (!enhanced?.evolution_chain?.url) {
      return res.json({ 
        status: "success", 
        data: { 
          pokemon: normalizedName, 
          evolution_chain: "N/A",
          spriteUrl: enhanced?.spriteUrl, // Include sprite URL
          cacheStats: cache.getStats()
        } 
      });
    }

    if (!cache.has(normalizedName, 'evolutionData')) {
      const evoRes = await fetchWithTimeout(enhanced.evolution_chain.url);
      const evoData = await evoRes.json();
      cache.set(normalizedName, analyzeEvolutionChain(evoData.chain, normalizedName), 'evolutionData');
    }

    const evoRes = await fetchWithTimeout(enhanced.evolution_chain.url);
    const evoData = await evoRes.json();

    const readableChain = simplifyChainForDebug(evoData.chain);
    const analysis = cache.get(normalizedName, 'evolutionData');

    res.json({
      status: "success",
      data: {
        pokemon: normalizedName,
        readable_chain: readableChain,
        total_species_in_chain: countChainSpecies(evoData.chain),
        chain_depth: getChainDepth(evoData.chain),
        branched_evolution: analysis.isBranched,
        evolution_stage: analysis.stage,
        region: enhanced.region,
        statuses: enhanced.statuses,
        spriteKey: enhanced.spriteKey,
        spriteUrl: enhanced.spriteUrl, // ✅ ADD sprite URL to debug output
        cacheStats: cache.getStats(),
      },
    });
  } catch (err) {
    console.error(`❌ debugEvolution(${req.params.name}) error:`, err.message);
    res.status(500).json({ 
      status: "error", 
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔍 GRAPHQL HEALTH CHECK                                                     */
/* -------------------------------------------------------------------------- */
export async function graphqlHealthCheck(req, res) {
  const testQuery = `
    query TestQuery {
      pokemon_v2_pokemon(where: { name: { _eq: "pikachu" } }) {
        id
        name
      }
    }
  `;
  try {
    const data = await graphqlFetch(testQuery);
    if (data?.pokemon_v2_pokemon?.length) {
      return res.json({ 
        status: "success", 
        graphql_working: true, 
        test_pokemon: data.pokemon_v2_pokemon[0],
        cacheStats: cache.getStats()
      });
    }
    res.json({ 
      status: "partial", 
      graphql_working: false, 
      message: "No Pokémon returned", 
      data,
      cacheStats: cache.getStats()
    });
  } catch (err) {
    res.json({ 
      status: "error", 
      graphql_working: false, 
      error: err.message, 
      message: "GraphQL not responding",
      cacheStats: cache.getStats()
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧹 CACHE MANAGEMENT ROUTES (Development only)                              */
/* -------------------------------------------------------------------------- */
export async function getCacheStats(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Cache stats not available in production' });
  }
  
  res.json({
    status: 'success',
    data: cache.getStats()
  });
}

export async function clearCache(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Cache clearance not available in production' });
  }
  
  const previousStats = cache.getStats();
  cache.clear();
  
  res.json({
    status: 'success',
    message: 'Cache cleared successfully',
    previousStats,
    currentStats: cache.getStats()
  });
}