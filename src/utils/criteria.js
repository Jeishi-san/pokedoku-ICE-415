import { generationToRegionName } from "./generationtoRegion.js";

// ✅ Validate if a Pokémon matches a given criterion
export function matchesCriterion(pokemon, criterion) {
  if (!criterion || !criterion.kind) return true;

  switch (criterion.kind) {
    case "type":
      // Pokémon.types is usually an array of type names ("fire", "water", etc.)
      return (
        pokemon.types &&
        pokemon.types.some(
          t => t.toLowerCase() === criterion.value.toLowerCase()
        )
      );

    case "region": {
      // Normalize Pokémon’s region from its generation
      const pokeRegion = pokemon.region
        ? pokemon.region            // If we’ve already set pokemon.region as "Kanto"/"Johto"/...
        : generationToRegionName(pokemon.generation); // Fallback to derived region

      return (
        pokeRegion &&
        pokeRegion.toLowerCase() === criterion.value.toLowerCase()
      );
    }

    case "special":
      // Expandable special category checks
      if (criterion.value === "Legendary") return !!pokemon.is_legendary;
      if (criterion.value === "Mythical") return !!pokemon.is_mythical;
      if (criterion.value === "Starter") return !!pokemon.is_starter;
      if (criterion.value === "Fossil") return !!pokemon.is_fossil;
      return false;

    default:
      return true; // Unknown criterion → treat as pass
  }
}
