// src/utils/api.js
const BACKEND_BASE = "http://localhost:3001/api";

/** 🧩 Fetch Pokémon list (from backend) */
export async function fetchAllPokemonNames() {
  const res = await fetch(`${BACKEND_BASE}/pokemon/all`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon list");
  return res.json();
}

/** 🧬 Fetch Pokémon details (from backend) */
export async function fetchPokemonDetails(name) {
  const res = await fetch(`${BACKEND_BASE}/pokemon/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch details for ${name}`);
  return res.json();
}

/** 🌍 Fetch Pokémon species (from backend) */
export async function fetchSpeciesByName(name) {
  const res = await fetch(`${BACKEND_BASE}/pokemon/species/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch species for ${name}`);
  return res.json();
}
