// src/utils/api.js

const GRAPHQL = "https://graphql-pokeapi.graphcdn.app/";

/**
 * Run a GraphQL request against GraphCDN endpoint
 * @param {string} query
 * @param {Object} variables
 */
export async function graphqlFetch(query, variables = {}) {
  try {
    const res = await fetch(GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`GraphQL request failed with status ${res.status}`);
    }

    const json = await res.json();

    if (json.errors) {
      console.error("GraphQL Errors:", json.errors);
      throw new Error(JSON.stringify(json.errors));
    }

    return json.data;
  } catch (err) {
    console.error("graphqlFetch error:", err);
    throw err;
  }
}

/**
 * Fetch all Pokémon names & images (uses paginated GraphQL endpoint)
 * We'll ask for a large limit to preload most Pokémon.
 * @returns {Promise<Array<{name:string,image:string,url:string}>>}
 */
export async function fetchAllPokemonNames() {
  const query = `
    query pokemons($limit: Int, $offset: Int) {
      pokemons(limit: $limit, offset: $offset) {
        count
        results {
          name
          image
          url
        }
      }
    }
  `;

  try {
    const data = await graphqlFetch(query, { limit: 2000, offset: 0 });
    return data?.pokemons?.results || [];
  } catch (err) {
    console.error("Failed to fetch all Pokémon names:", err);
    return [];
  }
}

/**
 * Fetch detailed Pokémon info (types, abilities, species URL, etc.)
 * @param {string} name
 * @returns {Promise<Object|null>}
 */
export async function fetchPokemonDetails(name) {
  if (!name) return null;

  const query = `
    query pokemon($name: String!) {
      pokemon(name: $name) {
        id
        name
        types {
          type { name }
        }
        abilities {
          ability { name }
        }
        moves {
          move { name }
        }
        species {
          url
          name
        }
        message
        status
      }
    }
  `;

  try {
    const data = await graphqlFetch(query, { name: name.toLowerCase() });
    return data?.pokemon || null;
  } catch (err) {
    console.error(`Failed to fetch details for ${name}:`, err);
    return null;
  }
}

/**
 * Fetch species data via the REST URL returned by GraphQL's species field.
 * Species data contains:
 * - generation.name
 * - is_legendary
 * - is_mythical
 * @param {string} url
 * @returns {Promise<Object|null>}
 */
export async function fetchSpeciesByUrl(url) {
  if (!url) return null;

  try {
    const res = await fetch(url, { redirect: "follow" });

    if (!res.ok) {
      throw new Error(`Failed to fetch species: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data; // includes generation.name, is_legendary, is_mythical
  } catch (err) {
    console.error("fetchSpeciesByUrl error:", err);
    return null;
  }
}
