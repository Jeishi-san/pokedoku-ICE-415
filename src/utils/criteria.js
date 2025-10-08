// Validate if a Pokémon matches a given criterion
export function matchesCriterion(pokemon, criterion) {
  if (!criterion || !criterion.kind) return true;

  switch (criterion.kind) {
    case "type":
      return pokemon.types.includes(criterion.value.toLowerCase());

    case "region":
      return pokemon.region.toLowerCase().includes(criterion.value.toLowerCase());

    case "special":
      if (criterion.value === "Legendary") return pokemon.is_legendary;
      if (criterion.value === "Mythical") return pokemon.is_mythical;
      // add "Starter", "Fossil", etc. if you expand later
      return false;

    default:
      return true; // unknown = pass
  }
}
