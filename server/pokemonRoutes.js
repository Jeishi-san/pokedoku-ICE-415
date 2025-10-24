// backend/pokemonRoutes.js
import express from "express";

const router = express.Router();

const GRAPHCDN = "https://graphql-pokeapi.graphcdn.app/";
const VERCEL = "https://graphql-pokeapi.vercel.app/api/graphql";
const REST_BASE = "https://pokeapi.co/api/v2/";

const cache = {
  pokemonNames: null,
  pokemonDetails: {},
  species: {},
};

/* -------------------------------------------------------------------------- */
/* 🧩 Helper Functions */
/* -------------------------------------------------------------------------- */

async function fetchWithTimeout(resource, options = {}, timeout = 7000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function mapGenerationToRegion(generation) {
  const map = {
    "generation-i": "Kanto",
    "generation-ii": "Johto",
    "generation-iii": "Hoenn",
    "generation-iv": "Sinnoh",
    "generation-v": "Unova",
    "generation-vi": "Kalos",
    "generation-vii": "Alola",
    "generation-viii": "Galar",
    "generation-ix": "Paldea",
  };
  return map[generation?.toLowerCase()] || "Unknown";
}

function getSpecialStatuses(name, speciesData) {
  const n = name.toLowerCase();

  const fossilList = [
    "kabuto", "kabutops", "omanyte", "omastar",
    "aerodactyl", "lileep", "cradily", "anorith", "armaldo",
    "cranidos", "rampardos", "shieldon", "bastiodon",
    "tirtouga", "carracosta", "archen", "archeops",
    "tyrunt", "tyrantrum", "amaura", "aurorus",
    "dracozolt", "arctozolt", "dracovish", "arctovish",
  ];

  const paradoxList = [
    "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks",
    "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns",
    "roaring-moon", "iron-valiant", "walking-wake", "iron-leaves", "gouging-fire", "raging-bolt",
    "iron-boulder", "iron-crown",
  ];

  const ultraBeasts = [
    "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana",
    "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon",
  ];

  const starters = [
    "bulbasaur", "charmander", "squirtle", "chikorita", "cyndaquil", "totodile",
    "treecko", "torchic", "mudkip", "turtwig", "chimchar", "piplup",
    "snivy", "tepig", "oshawott", "chespin", "fennekin", "froakie",
    "rowlet", "litten", "popplio", "grookey", "scorbunny", "sobble",
    "sprigatito", "fuecoco", "quaxly",
  ];

  const babyList = [
    "pichu", "cleffa", "igglybuff", "togepi", "tyrogue", "smoochum",
    "elekid", "magby", "azurill", "wynaut", "budew", "chingling",
    "bonsly", "mime-jr", "happiny", "munchlax", "riolu", "mantyke", "toxel",
  ];

  const statuses = [];
  if (speciesData?.is_legendary) statuses.push("Legendary");
  if (speciesData?.is_mythical) statuses.push("Mythical");
  if (ultraBeasts.includes(n)) statuses.push("Ultra Beast");
  if (paradoxList.includes(n)) statuses.push("Paradox Pokémon");
  if (starters.includes(n)) statuses.push("Starter Pokémon");
  if (fossilList.includes(n)) statuses.push("Fossil Pokémon");
  if (babyList.includes(n)) statuses.push("Baby Pokémon");

  return statuses.length ? statuses : ["Normal"];
}

async function graphqlFetch(query, variables = {}) {
  const endpoints = [GRAPHCDN, VERCEL];
  for (const endpoint of endpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      if (!res.ok) throw new Error(`GraphQL ${endpoint} failed: ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error(JSON.stringify(json.errors));
      return json.data;
    } catch (err) {
      console.warn(`⚠️ GraphQL endpoint failed (${endpoint}): ${err.message}`);
    }
  }
  throw new Error("❌ All GraphQL endpoints failed.");
}

/* -------------------------------------------------------------------------- */
/* 🚀 API Routes */
/* -------------------------------------------------------------------------- */

// ✅ Get all Pokémon names
router.get("/all", async (req, res) => {
  if (cache.pokemonNames) return res.json(cache.pokemonNames);

  const query = `
    query pokemons($limit: Int, $offset: Int) {
      pokemons(limit: $limit, offset: $offset) {
        results { name image url }
      }
    }
  `;

  try {
    const data = await graphqlFetch(query, { limit: 2000, offset: 0 });
    const results =
      data?.pokemons?.results?.map((p) => ({
        name: p.name,
        image: p.image || `https://img.pokemondb.net/sprites/home/normal/${p.name}.png`,
        url: p.url,
      })) || [];
    cache.pokemonNames = results;
    res.json(results);
  } catch (err) {
    console.warn("⚠️ GraphQL failed, using REST fallback...");
    try {
      const resp = await fetch(`${REST_BASE}pokemon?limit=2000`);
      const data = await resp.json();
      const results = data.results.map((p) => ({
        name: p.name,
        image: `https://img.pokemondb.net/sprites/home/normal/${p.name}.png`,
        url: p.url,
      }));
      cache.pokemonNames = results;
      res.json(results);
    } catch (restErr) {
      console.error("❌ REST fallback failed:", restErr);
      res.status(500).json({ error: "Failed to fetch Pokémon list" });
    }
  }
});

// ✅ Get Pokémon details
router.get("/:name", async (req, res) => {
  const name = req.params.name.toLowerCase();
  if (cache.pokemonDetails[name]) return res.json(cache.pokemonDetails[name]);

  const query = `
    query GetPokemon($name: String!) {
      pokemon(name: $name) {
        id
        name
        types { type { name } }
        sprites { front_default }
        species { name url }
      }
    }
  `;

  try {
    const data = await graphqlFetch(query, { name });
    if (!data?.pokemon) throw new Error("GraphQL returned null");
    const pokemon = {
      ...data.pokemon,
      sprites: {
        front_default:
          data.pokemon.sprites?.front_default ||
          `https://img.pokemondb.net/sprites/home/normal/${name}.png`,
      },
    };
    cache.pokemonDetails[name] = pokemon;
    res.json(pokemon);
  } catch (err) {
    console.warn(`⚠️ GraphQL failed for ${name}, using REST fallback...`);
    try {
      const response = await fetch(`${REST_BASE}pokemon/${name}`);
      if (!response.ok) throw new Error("Pokémon not found");
      const data = await response.json();
      const pokemon = {
        id: data.id,
        name: data.name,
        types: data.types.map((t) => ({ type: { name: t.type.name } })),
        sprites: {
          front_default:
            data.sprites.front_default ||
            `https://img.pokemondb.net/sprites/home/normal/${data.name}.png`,
        },
        species: { name: data.species.name, url: data.species.url },
      };
      cache.pokemonDetails[name] = pokemon;
      res.json(pokemon);
    } catch (fallbackErr) {
      console.error(`❌ Both GraphQL and REST failed for ${name}:`, fallbackErr);
      res.status(500).json({ error: "Failed to fetch Pokémon data" });
    }
  }
});

// ✅ Get Pokémon species (handles forms safely)
router.get("/species/:name", async (req, res) => {
  const name = req.params.name.toLowerCase();
  const baseUrl = `${REST_BASE}pokemon-species/`;

  // Check cache
  if (cache.species[name]) return res.json(cache.species[name]);

  try {
    // Try the full name first
    let response = await fetchWithTimeout(`${baseUrl}${name}`);
    if (!response.ok) {
      // fallback: strip form suffixes like -therian, -alola, -galar, etc.
      const simplified = name
        .replace(/-therian|-(alola|galar|hisui|paldea|mega|totem|eternamax|origin|10|50|school|hero).*/i, "")
        .replace(/-.*$/, ""); // final cleanup
      response = await fetchWithTimeout(`${baseUrl}${simplified}`);
    }

    if (!response.ok) {
      return res.status(404).json({ error: `Species not found for ${name}` });
    }

    const data = await response.json();
    data.region = mapGenerationToRegion(data.generation?.name);
    data.specialStatuses = getSpecialStatuses(data.name, data);
    cache.species[name] = data;
    res.json(data);
  } catch (err) {
    console.error("❌ fetchSpeciesByName error:", err);
    res.status(500).json({ error: "Failed to fetch species data" });
  }
});

export default router;
