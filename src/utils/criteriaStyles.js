// utils/criteriaStyles.js

export const criteriaColors = {
  // Types
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

  // Regions
  region_kanto: "bg-pink-200 text-pink-900",
  region_johto: "bg-orange-200 text-orange-900",
  region_hoenn: "bg-green-200 text-green-900",
  region_sinnoh: "bg-blue-200 text-blue-900",
  region_unova: "bg-indigo-200 text-indigo-900",
  region_kalos: "bg-purple-200 text-purple-900",
  region_alola: "bg-teal-200 text-teal-900",
  region_galar: "bg-gray-300 text-gray-900",
  region_paldea: "bg-lime-200 text-lime-900",

  // Specials
  special_legendary: "bg-indigo-300 text-indigo-900",
  special_mythical: "bg-teal-300 text-teal-900",
  special_starter: "bg-lime-200 text-lime-900",
  special_fossil: "bg-yellow-200 text-yellow-900",

  // Default fallback
  default: "bg-gray-200 text-gray-800",
};

/**
 * Get Tailwind-style classes for a given criterion
 * @param {{ kind: string, value: string }} criterion
 * @returns {string} class names
 */
export function getCriteriaStyle({ kind, value }) {
  if (!kind || !value) return criteriaColors.default;
  const key = `${kind.toLowerCase()}_${value.toLowerCase()}`;
  return criteriaColors[key] || criteriaColors.default;
}
