// src/utils/api.js
const GRAPHQL = "https://graphql-pokeapi.graphcdn.app/";

/**
 * Run a GraphQL request against GraphCDN endpoint
 */
export async function graphqlFetch(query, variables = {}) {
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/**
 * Fetch all pokemon names & images (paginated endpoint supports limit)
 * We'll ask for a large limit (e.g., 2000) to preload all names.
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
  const data = await graphqlFetch(query, { limit: 2000, offset: 0 });
  return data?.pokemons?.results || [];
}

/**
 * Fetch detailed pokemon info (types + species url)
 */
export async function fetchPokemonDetails(name) {
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
  const data = await graphqlFetch(query, { name: name.toLowerCase() });
  return data?.pokemon || null;
}

/**
 * Fetch species via REST URL returned from GraphQL species.url
 * Example species response contains `generation` and `is_legendary`, `is_mythical`
 */
export async function fetchSpeciesByUrl(url) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch species");
  return res.json(); // contains generation.name and is_legendary fields
}
