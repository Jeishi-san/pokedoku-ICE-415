// ✅ server/services/pokemonService.js (Enhanced Safety Version)
import { graphqlFetch, fetchWithTimeout } from "../utils/apiClient.js";
import { normalizeVariantName } from "../utils/nameUtils.js";
import { analyzeEvolutionChain, normalizeGraphQLEvolutionResponse } from "../utils/evolutionUtils.js";
import { handleSpecialForms } from "../utils/specialForms.js";
import { getPokemonRegion, getSpecialStatuses } from "../utils/pokemonData.js";

const REST_BASE = "https://pokeapi.co/api/v2/";

/* -------------------------------------------------------------------------- */
/* 🔒 SAFE CACHE IMPLEMENTATION                                              */
/* -------------------------------------------------------------------------- */
class SafeCache {
  constructor(maxSize = 1000, ttl = 15 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.clear();
  }

  clear() {
    this.species = new Map();
    this.names = null;
    this.evolution = new Map();
    this.timestamps = new Map();
  }

  set(key, value, namespace = 'species') {
    if (this[namespace]?.size >= this.maxSize) {
      this.cleanup();
    }
    if (namespace === 'names') {
      this.names = value;
    } else {
      this[namespace].set(key, value);
    }
    this.timestamps.set(`${namespace}.${key}`, Date.now());
  }

  get(key, namespace = 'species') {
    if (namespace === 'names') return this.names;
    
    const timestamp = this.timestamps.get(`${namespace}.${key}`);
    if (timestamp && Date.now() - timestamp > this.ttl) {
      this[namespace].delete(key);
      this.timestamps.delete(`${namespace}.${key}`);
      return null;
    }
    return this[namespace].get(key);
  }

  has(key, namespace = 'species') {
    if (namespace === 'names') return this.names !== null;
    
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
        if (namespace !== 'names') {
          this[namespace]?.delete(actualKey);
        }
        this.timestamps.delete(key);
      }
    }
  }

  getStats() {
    return {
      species: this.species.size,
      evolution: this.evolution.size,
      names: this.names ? this.names.length : 0,
      totalEntries: this.timestamps.size
    };
  }
}

const cache = new SafeCache();

/* -------------------------------------------------------------------------- */
/* 🛠 ENVIRONMENT-AWARE LOGGING                                                 */
/* -------------------------------------------------------------------------- */
const log = (...args) => {
  if (process.env.NODE_ENV !== "production") console.log(...args);
};

const logError = (context, message, error) => {
  console.error(`❌ [${context}] ${message}:`, error?.message || error);
  if (process.env.NODE_ENV === 'development' && error?.stack) {
    console.error('Stack:', error.stack);
  }
};

/* -------------------------------------------------------------------------- */
/* 🛡️ INPUT VALIDATION & SAFETY                                                */
/* -------------------------------------------------------------------------- */
function validatePokemonName(name, context = "API") {
  if (!name || typeof name !== "string") {
    throw new Error(`[${context}] Invalid Pokémon name: ${name}`);
  }

  const cleanName = name.trim().toLowerCase();
  if (cleanName.length === 0 || cleanName.length > 50) {
    throw new Error(`[${context}] Pokémon name must be between 1 and 50 characters`);
  }

  if (!/^[a-z0-9-]+$/.test(cleanName)) {
    throw new Error(`[${context}] Invalid characters in Pokémon name`);
  }

  return cleanName;
}

function safeJsonParse(data, defaultValue = {}) {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    logError('safeJsonParse', 'Failed to parse JSON', error);
    return defaultValue;
  }
}

/* -------------------------------------------------------------------------- */
/* 🎯 FETCH MAIN SPECIES DATA                                                  */
/* -------------------------------------------------------------------------- */
export async function fetchSpeciesData(name, context = "API") {
  let normalizedName;
  
  try {
    normalizedName = validatePokemonName(name, context);
    normalizedName = normalizeVariantName(normalizedName);

    // Check cache first
    if (cache.has(normalizedName, 'species')) {
      log(`[fetchSpeciesData] Cache hit for ${normalizedName}`);
      return cache.get(normalizedName, 'species');
    }

    let speciesData;
    let dataSource = 'none';

    // Try GraphQL first
    try {
      const graphqlData = await fetchGraphQLData(normalizedName, context);
      if (graphqlData) {
        speciesData = await buildPokemonData(normalizedName, graphqlData, context);
        dataSource = 'graphql';
      }
    } catch (graphqlError) {
      log(`[fetchSpeciesData] GraphQL failed for ${normalizedName}:`, graphqlError.message);
    }

    // Fall back to REST if GraphQL failed or returned no data
    if (!speciesData) {
      try {
        speciesData = await fetchRESTData(normalizedName, context);
        dataSource = 'rest';
      } catch (restError) {
        log(`[fetchSpeciesData] REST failed for ${normalizedName}:`, restError.message);
        throw new Error(`Failed to fetch data for ${normalizedName} from both GraphQL and REST`);
      }
    }

    if (!speciesData) {
      throw new Error(`No data found for Pokémon: ${normalizedName}`);
    }

    // Cache the successful result
    cache.set(normalizedName, speciesData, 'species');
    log(`[fetchSpeciesData] ${normalizedName} loaded via ${dataSource}`);
    
    return speciesData;
  } catch (error) {
    logError('fetchSpeciesData', `Failed to fetch ${normalizedName || name}`, error);
    
    // Re-throw with context
    if (error.message.includes('Invalid') || error.message.includes('must be')) {
      throw error; // Validation errors
    }
    
    throw new Error(`Failed to fetch Pokémon data: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧠 FETCH ALL POKÉMON NAMES                                                  */
/* -------------------------------------------------------------------------- */
export async function getAllPokemonNames(context = "Init") {
  try {
    if (cache.names) {
      log(`[getAllPokemonNames] Cache hit, returning ${cache.names.length} names`);
      return cache.names;
    }

    const res = await fetchWithTimeout(`${REST_BASE}pokemon-species?limit=2000`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json().catch(error => {
      throw new Error(`Failed to parse response: ${error.message}`);
    });

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from Pokémon API');
    }

    const allNames = data.results
      .map(s => s?.name?.toLowerCase())
      .filter(name => name && typeof name === 'string');

    const processedNames = allNames.map(n => 
      handleSpecialForms(n, { name: n })
    ).filter(Boolean);

    cache.set('names', processedNames, 'names');
    log(`[getAllPokemonNames] Loaded ${processedNames.length} Pokémon names`);
    
    return processedNames;
  } catch (error) {
    logError('getAllPokemonNames', 'Failed to fetch Pokémon names', error);
    
    // Return empty array rather than throwing to prevent service disruption
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* 🔄 GRAPHQL FETCH HELPER                                                     */
/* -------------------------------------------------------------------------- */
async function fetchGraphQLData(normalizedName, context) {
  const query = `
    query getPokemonByName($name: String!) {
      pokemon_v2_pokemon(where: { name: { _eq: $name } }) {
        id
        name
        pokemon_v2_pokemontypes { pokemon_v2_type { name } }
        pokemon_v2_pokemonspecy {
          name
          is_legendary
          is_mythical
          generation_id
          pokemon_v2_generation { name }
          evolution_chain_id
        }
      }
    }
  `;

  try {
    const data = await graphqlFetch(query, { name: normalizedName });
    
    if (!data) {
      throw new Error('No data returned from GraphQL');
    }

    return data?.pokemon_v2_pokemon?.[0] || null;
  } catch (error) {
    log(`[fetchGraphQLData] ${normalizedName} failed:`, error.message);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔄 BUILD POKÉMON DATA (GraphQL OR REST)                                     */
/* -------------------------------------------------------------------------- */
async function buildPokemonData(normalizedName, pokemon, context) {
  if (!pokemon) return null;

  const species = pokemon.pokemon_v2_pokemonspecy || {};
  const generationValue = species.pokemon_v2_generation?.name || "unknown";
  const types = pokemon.pokemon_v2_pokemontypes?.map(t => t.pokemon_v2_type?.name).filter(Boolean) || [];

  // Change default evolution stage from "First Stage" to "Base Stage"
  let evoInfo = { stage: "Base Stage", evolvedBy: "None", isBranched: false };
  let evolutionChainUrl = null;

  // FIX: Properly set evolution chain URL for GraphQL
  if (species.evolution_chain_id) {
    evolutionChainUrl = `${REST_BASE}evolution-chain/${species.evolution_chain_id}`;
    evoInfo = await processEvolutionChain(evolutionChainUrl, species.name || normalizedName, context);
  }

  const baseResult = {
    name: normalizedName,
    region: getPokemonRegion(normalizedName, generationValue),
    evolution: evoInfo.stage, // This should match your current naming
    statuses: getSpecialStatuses(normalizedName, species),
    generation: generationValue,
    types,
    evolution_chain: evolutionChainUrl ? { url: evolutionChainUrl } : null, // FIX: Add evolution chain
    dataSource: 'graphql'
  };

  return handleSpecialForms(normalizedName, baseResult);
}

/* -------------------------------------------------------------------------- */
/* 🔄 REST FALLBACK DATA                                                       */
/* -------------------------------------------------------------------------- */
async function fetchRESTData(normalizedName, context) {
  const baseName = getBaseName(normalizedName) || normalizedName;

  let species = {};
  let pokemonData = {};
  let generationValue = "unknown";

  try {
    const speciesRes = await fetchWithTimeout(`${REST_BASE}pokemon-species/${baseName}`);
    if (speciesRes.ok) {
      species = await speciesRes.json().catch(() => ({}));
      generationValue = species.generation?.name || "unknown";
    } else if (speciesRes.status === 404) {
      log(`[fetchRESTData] Species not found: ${baseName}`);
    } else {
      log(`[fetchRESTData] Species fetch failed: ${speciesRes.status}`);
    }
  } catch (error) {
    log(`[fetchRESTData] Species fetch error for ${normalizedName}:`, error.message);
  }

  try {
    const pokemonRes = await fetchWithTimeout(`${REST_BASE}pokemon/${normalizedName}`);
    if (pokemonRes.ok) {
      pokemonData = await pokemonRes.json().catch(() => ({}));
    } else if (pokemonRes.status === 404) {
      // Try with base name as fallback
      if (baseName !== normalizedName) {
        const fallbackRes = await fetchWithTimeout(`${REST_BASE}pokemon/${baseName}`);
        if (fallbackRes.ok) {
          pokemonData = await fallbackRes.json().catch(() => ({}));
        }
      }
    }
  } catch (error) {
    log(`[fetchRESTData] Pokémon fetch error for ${normalizedName}:`, error.message);
  }

  // If both requests failed, throw error
  if (Object.keys(species).length === 0 && Object.keys(pokemonData).length === 0) {
    throw new Error(`No data available from REST API for ${normalizedName}`);
  }

  return buildPokemonDataFromREST(normalizedName, species, pokemonData);
}

/* -------------------------------------------------------------------------- */
/* 🔄 BUILD POKÉMON DATA FROM REST                                             */
/* -------------------------------------------------------------------------- */
async function buildPokemonDataFromREST(normalizedName, species, pokemonData) {
  const generationValue = species.generation?.name || "unknown";
  const types =
    pokemonData.types?.map(t => t.type?.name).filter(Boolean) ||
    species.types?.map(t => t.pokemon_v2_type?.name).filter(Boolean) || [];

  let evoInfo = { stage: "First Stage", evolvedBy: "None", isBranched: false };
  
  // FIX: Properly handle evolution chain for REST
  if (species.evolution_chain?.url) {
    evoInfo = await processEvolutionChain(species.evolution_chain.url, normalizedName, "REST");
  }

  const baseResult = {
    name: normalizedName,
    region: getPokemonRegion(normalizedName, generationValue),
    evolution: evoInfo.stage,
    statuses: getSpecialStatuses(normalizedName, species),
    generation: generationValue,
    types,
    evolution_chain: species.evolution_chain || null, // FIX: Pass through evolution chain
    dataSource: 'rest'
  };

  return handleSpecialForms(normalizedName, baseResult);
}


/* -------------------------------------------------------------------------- */
/* 🧬 EVOLUTION CHAIN PROCESSING                                               */
/* -------------------------------------------------------------------------- */
async function processEvolutionChain(evolutionUrl, speciesName, context) {
  if (cache.has(speciesName, 'evolution')) {
    return cache.get(speciesName, 'evolution');
  }

  try {
    const res = await fetchWithTimeout(evolutionUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch evolution chain`);
    }

    const data = await res.json().catch(error => {
      throw new Error(`Invalid JSON in evolution response: ${error.message}`);
    });

    const chain = normalizeGraphQLEvolutionResponse(data.chain || data);
    if (!chain) {
      throw new Error('No evolution chain data found');
    }

    const analysis = analyzeEvolutionChain(chain, speciesName);
    cache.set(speciesName, analysis, 'evolution');
    
    return analysis;
  } catch (error) {
    logError('processEvolutionChain', `Failed to process evolution for ${speciesName}`, error);
    
    // Return default evolution info rather than failing completely
    return { stage: "Unknown", evolvedBy: "None", isBranched: false };
  }
}

/* -------------------------------------------------------------------------- */
/* 🧩 UTILITIES                                                                */
/* -------------------------------------------------------------------------- */
function getBaseName(normalizedName) {
  if (!normalizedName || typeof normalizedName !== 'string') {
    return normalizedName;
  }

  return normalizedName
    .replace(/-mega(-x|-y)?$/, "")
    .replace(/-gmax$/, "")
    .replace(/-alola$/, "")
    .replace(/-galar$/, "")
    .replace(/-hisui$/, "")
    .replace(/-paldea$/, "")
    .replace(/-primal$/, "");
}

/* -------------------------------------------------------------------------- */
/* 🧹 CACHE MANAGEMENT                                                        */
/* -------------------------------------------------------------------------- */
export function getCacheStats() {
  return cache.getStats();
}

export function clearCache() {
  const previousStats = cache.getStats();
  cache.clear();
  return { previousStats, currentStats: cache.getStats() };
}