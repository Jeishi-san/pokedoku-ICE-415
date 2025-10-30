// src/utils/criteria.js
import { getSpecialCategory } from "./specialPokemon.js";

/**
 * 🧩 Utility: Check if any aliases match a value
 */
function matchesAliases(value, key, aliases = []) {
  const v = value.toLowerCase();
  return v === key || aliases.includes(v);
}

/**
 * ✅ Determines if a Pokémon matches a given criterion
 * Unified for both frontend and backend data structures
 *
 * @param {Object} pokemon - Pokémon data (normalized)
 * @param {Object} criterion - { kind: 'type' | 'region' | 'special' | 'stage' | 'evolution', value: string }
 * @returns {boolean}
 */
export function matchesCriterion(pokemon = {}, criterion = {}) {
  if (!criterion.kind || !criterion.value) return true;
  if (!pokemon || typeof pokemon !== "object") return false;

  const value = criterion.value.toLowerCase().trim();

  switch (criterion.kind) {
    /* ---------------------------------------------------------------------- */
    /* 🔥 TYPE                                                               */
    /* ---------------------------------------------------------------------- */
    case "type": {
      const types =
        pokemon.types?.map((t) =>
          typeof t === "string"
            ? t.toLowerCase()
            : t?.type?.name?.toLowerCase()
        ) || [];

      return types.includes(value);
    }

    /* ---------------------------------------------------------------------- */
    /* 🌍 REGION                                                             */
    /* ---------------------------------------------------------------------- */
    case "region": {
      const region =
        pokemon.region?.toLowerCase?.() ||
        pokemon.generation?.toLowerCase?.() ||
        "";

      if (!region) return false;

      const regionAliases = {
        kanto: ["generation-i", "gen-1", "1"],
        johto: ["generation-ii", "gen-2", "2"],
        hoenn: ["generation-iii", "gen-3", "3"],
        sinnoh: ["generation-iv", "gen-4", "4"],
        unova: ["generation-v", "gen-5", "5"],
        kalos: ["generation-vi", "gen-6", "6"],
        alola: ["generation-vii", "gen-7", "7"],
        galar: ["generation-viii", "gen-8", "8"],
        paldea: ["generation-ix", "gen-9", "9"],
      };

      return Object.entries(regionAliases).some(([key, aliases]) =>
        matchesAliases(value, key, aliases)
          ? region.includes(key)
          : false
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 🌟 SPECIAL CATEGORY                                                   */
    /* ---------------------------------------------------------------------- */
    case "special": {
      const computed = getSpecialCategory(pokemon.name);
      const category = pokemon.category?.toLowerCase?.() || "";
      const status = pokemon.status?.toLowerCase?.() || "";

      const flags = {
        legendary:
          pokemon.is_legendary ||
          category === "legendary" ||
          computed === "legendary",
        mythical:
          pokemon.is_mythical ||
          category === "mythical" ||
          computed === "mythical",
        starter:
          category === "starter" || computed === "starter",
        fossil:
          category === "fossil" || computed === "fossil",
        ultrabeast:
          category === "ultra-beast" ||
          category === "ultrabeast" ||
          computed === "ultra-beast" ||
          computed === "ultrabeast",
        paradox:
          category === "paradox" || computed === "paradox",
        baby: category === "baby" || computed === "baby",
      };

      const val = value.replace(/\s+/g, "-");

      return (
        flags[val] ||
        category.includes(val) ||
        computed.includes(val) ||
        status.includes(val)
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 🧬 EVOLUTION STAGE                                                    */
    /* ---------------------------------------------------------------------- */
    case "stage": {
      const stage = pokemon.stage?.toLowerCase?.() || "";
      if (!stage) return false;

      const stageAliases = {
        "first stage": ["base", "first", "stage-1"],
        "middle stage": ["middle", "second", "stage-2"],
        "final stage": ["final", "last", "stage-3"],
        "single stage": ["single", "only", "solo"],
      };

      return Object.entries(stageAliases).some(([key, aliases]) =>
        matchesAliases(value, key, aliases)
          ? stage.includes(key.split(" ")[0])
          : false
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 🧩 EVOLUTION DETAILS                                                  */
    /* ---------------------------------------------------------------------- */
    case "evolution": {
      const evo = pokemon.evolution || {};
      const val = value.toLowerCase();

      // Position (Start / Middle / Final / Branched)
      if (evo.position?.toLowerCase?.().includes(val)) return true;

      // Method (Item / Trade / Level-up / Friendship / None)
      if (evo.method?.toLowerCase?.().includes(val)) return true;
      if (evo.evolvedBy?.toLowerCase?.().includes(val)) return true;

      // Branching
      if (typeof evo.isBranched === "boolean") {
        if (val === "branched" && evo.isBranched) return true;
        if (val === "not-branched" && !evo.isBranched) return true;
      }

      return false;
    }

    /* ---------------------------------------------------------------------- */
    /* 🧩 DEFAULT (no filtering)                                             */
    /* ---------------------------------------------------------------------- */
    default:
      return true;
  }
}
