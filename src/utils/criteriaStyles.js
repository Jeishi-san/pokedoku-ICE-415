// src/utils/criteriaStyles.js

export const criteriaColors = {
  /* -------------------------------------------------------------------------- */
  /* 🧩 TYPES                                                                  */
  /* -------------------------------------------------------------------------- */
  type_normal: "bg-gray-200 text-gray-900",
  type_fire: "bg-red-300 text-red-900",
  type_water: "bg-blue-300 text-blue-900",
  type_grass: "bg-green-300 text-green-900",
  type_electric: "bg-yellow-200 text-yellow-900",
  type_ice: "bg-cyan-200 text-cyan-900",
  type_fighting: "bg-orange-300 text-orange-900",
  type_poison: "bg-purple-300 text-purple-900",
  type_ground: "bg-yellow-300 text-yellow-900",
  type_flying: "bg-indigo-200 text-indigo-900",
  type_psychic: "bg-pink-300 text-pink-900",
  type_bug: "bg-lime-200 text-lime-900",
  type_rock: "bg-stone-300 text-stone-900",
  type_ghost: "bg-violet-300 text-violet-900",
  type_dragon: "bg-purple-200 text-purple-900",
  type_dark: "bg-gray-400 text-gray-900",
  type_steel: "bg-slate-200 text-slate-900",
  type_fairy: "bg-pink-200 text-pink-900",

  /* -------------------------------------------------------------------------- */
  /* 🌍 REGIONS                                                                */
  /* -------------------------------------------------------------------------- */
  region_kanto: "bg-pink-200 text-pink-900",
  region_johto: "bg-orange-200 text-orange-900",
  region_hoenn: "bg-green-200 text-green-900",
  region_sinnoh: "bg-blue-200 text-blue-900",
  region_unova: "bg-indigo-200 text-indigo-900",
  region_kalos: "bg-purple-200 text-purple-900",
  region_alola: "bg-teal-200 text-teal-900",
  region_galar: "bg-gray-300 text-gray-900",
  region_paldea: "bg-lime-200 text-lime-900",

  /* -------------------------------------------------------------------------- */
  /* 🌟 SPECIALS                                                               */
  /* -------------------------------------------------------------------------- */
  special_legendary: "bg-indigo-300 text-indigo-900",
  special_mythical: "bg-teal-300 text-teal-900",
  special_starter: "bg-lime-200 text-lime-900",
  special_fossil: "bg-yellow-200 text-yellow-900",
  special_ultrabeast: "bg-purple-300 text-purple-900",
  special_paradox: "bg-rose-200 text-rose-900",
  special_baby: "bg-sky-200 text-sky-900",

  /* -------------------------------------------------------------------------- */
  /* 🧬 EVOLUTION STAGES (Simple Stage Filter)                                 */
  /* -------------------------------------------------------------------------- */
  stage_base: "bg-emerald-200 text-emerald-900",
  stage_middle: "bg-amber-200 text-amber-900",
  stage_final: "bg-red-200 text-red-900",
  stage_single: "bg-gray-200 text-gray-900",

  /* -------------------------------------------------------------------------- */
  /* 🔁 EVOLUTION DETAILS (Advanced Evolution Filters)                         */
  /* -------------------------------------------------------------------------- */
  evolution_start: "bg-green-200 text-green-900",
  evolution_middle: "bg-yellow-200 text-yellow-900",
  evolution_final: "bg-red-200 text-red-900",
  evolution_branched: "bg-purple-200 text-purple-900",
  evolution_notbranched: "bg-gray-200 text-gray-900",

  evolution_item: "bg-blue-200 text-blue-900",
  evolution_trade: "bg-pink-200 text-pink-900",
  evolution_friendship: "bg-rose-200 text-rose-900",
  evolution_levelup: "bg-orange-200 text-orange-900",
  evolution_none: "bg-slate-200 text-slate-900",

  /* -------------------------------------------------------------------------- */
  /* 🧱 DEFAULT FALLBACK                                                      */
  /* -------------------------------------------------------------------------- */
  default: "bg-gray-200 text-gray-800",
};

/**
 * ✅ Get Tailwind-style classes for a given criterion
 * @param {{ kind: string, value: string }} criterion
 * @returns {string} class names
 */
export function getCriteriaStyle({ kind, value }) {
  if (!kind || !value) return criteriaColors.default;

  const key = `${kind.toLowerCase()}_${value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")}`; // Normalize spaces & dashes

  return criteriaColors[key] || criteriaColors.default;
}
