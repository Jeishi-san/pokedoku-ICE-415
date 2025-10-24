// src/utils/criteria.js

import { getSpecialCategory } from "./specialPokemon";

/**
 * ✅ Checks whether a Pokémon matches a specific criterion (type, region, or special category)
 * @param {Object} pokemon - Pokémon data (types, region, is_legendary, is_mythical, category, etc.)
 * @param {Object} criterion - { kind: 'type' | 'region' | 'special', value: string }
 * @returns {boolean} true if Pokémon satisfies the criterion
 */
export function matchesCriterion(pokemon = {}, criterion = {}) {
  if (!criterion.kind || !criterion.value) return true; // allow empty criteria

  const value = criterion.value.toString().toLowerCase().trim();

  switch (criterion.kind) {
    /* ---------------------- 🔥 TYPE CRITERIA ---------------------- */
    case "type": {
      if (!Array.isArray(pokemon.types)) return false;
      return pokemon.types.some((t) => t.toLowerCase() === value);
    }

    /* ---------------------- 🌍 REGION CRITERIA ---------------------- */
    case "region": {
      if (!pokemon.region) return false;
      const region = pokemon.region.toString().toLowerCase();

      // Allow flexible region keyword matching (e.g. "gen-1" → "kanto")
      const regionAliases = {
        kanto: ["generation-i", "gen-1"],
        johto: ["generation-ii", "gen-2"],
        hoenn: ["generation-iii", "gen-3"],
        sinnoh: ["generation-iv", "gen-4"],
        unova: ["generation-v", "gen-5"],
        kalos: ["generation-vi", "gen-6"],
        alola: ["generation-vii", "gen-7"],
        galar: ["generation-viii", "gen-8"],
        paldea: ["generation-ix", "gen-9"],
      };

      // Match either direct string or alias
      return (
        region.includes(value) ||
        Object.entries(regionAliases).some(([key, aliases]) =>
          key === value || aliases.includes(value)
            ? region.includes(key) || aliases.some((a) => region.includes(a))
            : false
        )
      );
    }

    /* ---------------------- 🌟 SPECIAL CRITERIA ---------------------- */
    case "special": {
      const special = getSpecialCategory(pokemon.name);
      const category = pokemon.category?.toLowerCase() || "";
      const val = value.toLowerCase();

      // Handle well-known special flags
      switch (val) {
        case "legendary":
          return !!pokemon.is_legendary || special === "legendary";
        case "mythical":
          return !!pokemon.is_mythical || special === "mythical";
        case "fossil":
          return special === "fossil" || category === "fossil";
        case "starter":
          return special === "starter" || category === "starter";
        case "ultra-beast":
        case "ultrabeast":
          return special === "ultra-beast" || category === "ultra-beast";
        case "paradox":
          return special === "paradox" || category === "paradox";
        case "baby":
          return special === "baby" || category === "baby";
        default:
          return special === val || category === val;
      }
    }

    /* ---------------------- 🧩 DEFAULT ---------------------- */
    default:
      // Unknown or unsupported criteria pass by default
      return true;
  }
}
