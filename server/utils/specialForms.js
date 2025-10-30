// ✅ server/utils/specialForms.js
import {
  getSpecialStatuses,
  getSpecialFormEvolution,
  getSpecialFormRegion,
  getSpecialFormTypes,
} from "../specialPokemon.js";

import { mapGenerationToRegion } from "../generationtoRegion.js";

/**
 * 🧩 Enhances Pokémon data with special form overrides
 * Handles Mega, Gmax, Alola, Galar, Hisui, Paldea, Primal, Ash, Zygarde, etc.
 */
export function handleSpecialForms(name, baseResult) {
  const result = { ...baseResult };
  const lowerName = name.toLowerCase();

  try {
    // 🧬 Evolution form overrides
    const specialEvolution = getSpecialFormEvolution(lowerName);
    if (specialEvolution && specialEvolution !== result.evolution) {
      result.evolution = specialEvolution;
    }

    // 🌍 Region-specific form
    const specialRegion = getSpecialFormRegion(lowerName);
    if (specialRegion && specialRegion !== result.region) {
      result.region = specialRegion;
    }

    // 🔥 Type overrides
    const specialTypes = getSpecialFormTypes(lowerName);
    if (Array.isArray(specialTypes) && specialTypes.length > 0) {
      result.types = specialTypes;
    }

    // 💎 Status overrides
    const specialStatuses = getSpecialStatuses(lowerName, {});
    if (
      Array.isArray(specialStatuses) &&
      specialStatuses.length > 0 &&
      !specialStatuses.includes("Normal Pokémon")
    ) {
      result.statuses = specialStatuses;
    }

    // ⚙️ Region correction for Mega / Gmax / Primal
    if (/mega|gmax|gigantamax|primal/.test(lowerName)) {
      const baseName = lowerName
        .replace("-mega-x", "")
        .replace("-mega-y", "")
        .replace("-mega", "")
        .replace("-gmax", "")
        .replace("-gigantamax", "")
        .replace("-primal", "");

      result.region =
        baseResult.region ||
        mapGenerationToRegion(baseResult.generation || "gen-1") ||
        "Unknown";
    }

    // 🧩 Standardized display name
    result.displayName = formatDisplayName(lowerName);

    // 🖼 Sprite-safe key for frontend
    result.spriteKey = mapSpriteKey(lowerName);

  } catch (error) {
    console.warn(`⚠️ Error handling special forms for ${name}: ${error.message}`);
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* 🔠 Format names for display consistency */
/* -------------------------------------------------------------------------- */
function formatDisplayName(name) {
  if (name.includes("-mega-x")) return "Mega Charizard X";
  if (name.includes("-mega-y")) return "Mega Charizard Y";
  if (name.includes("-mega")) return `Mega ${capitalize(name.replace("-mega", ""))}`;
  if (name.includes("-gmax") || name.includes("-gigantamax")) return `${capitalize(name.replace(/-(gmax|gigantamax)/, ""))} (Gmax)`;
  if (name.includes("-alola")) return `${capitalize(name.replace("-alola", ""))} (Alolan)`;
  if (name.includes("-galar")) return `${capitalize(name.replace("-galar", ""))} (Galarian)`;
  if (name.includes("-hisui")) return `${capitalize(name.replace("-hisui", ""))} (Hisuian)`;
  if (name.includes("-paldea")) return `${capitalize(name.replace("-paldea", ""))} (Paldean)`;
  if (name.includes("-primal")) return `Primal ${capitalize(name.replace("-primal", ""))}`;
  if (name.includes("-ash")) return `${capitalize(name.replace("-ash", ""))} (Ash)`;
  if (/zygarde-(10|50|complete)/.test(name)) return "Zygarde Form";
  return capitalize(name);
}

/* -------------------------------------------------------------------------- */
/* 🖼 Map Pokémon name to PokémonDB sprite-safe key */
/* -------------------------------------------------------------------------- */
function mapSpriteKey(name) {
  let key = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/'/g, "")
    .replace(/:/g, "")
    .replace(/-alola$/, "-alolan")
    .replace(/-galar$/, "-galarian")
    .replace(/-paldea$/, "-paldean")
    .replace(/-gmax$/, "-gigantamax");

  const exceptions = {
    "calyrex-ice": "calyrex-ice-rider",
    "calyrex-shadow": "calyrex-shadow-rider",
    "rattata-alola": "rattata-alolan",
    "raticate-alola": "raticate-alolan",
    "venusaur-gmax": "venusaur-gigantamax",
    "arcanine-hisui": "arcanine-hisuian",
    "lilligant-hisui": "lilligant-hisuian",
    "samurott-hisui": "samurott-hisuian",
    "zygarde-10": "zygarde-10",
    "zygarde-50": "zygarde-50",
    "zygarde-complete": "zygarde-complete",
  };

  if (exceptions[key]) key = exceptions[key];
  return key;
}

/* -------------------------------------------------------------------------- */
/* 🧠 Capitalize first letter helper */
/* -------------------------------------------------------------------------- */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
