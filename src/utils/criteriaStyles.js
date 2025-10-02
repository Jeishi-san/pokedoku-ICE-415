// utils/criteriaStyles.js
export const criteriaColors = {
  type_water: "bg-blue-300 text-blue-900",
  type_grass: "bg-green-300 text-green-900",
  type_fire: "bg-red-300 text-red-900",
  type_electric: "bg-yellow-200 text-yellow-900",
  type_psychic: "bg-purple-300 text-purple-900",

  region_kanto: "bg-pink-200 text-pink-900",
  region_johto: "bg-orange-200 text-orange-900",
  region_hoenn: "bg-green-200 text-green-900",

  special_legendary: "bg-indigo-300 text-indigo-900",
  special_mythical: "bg-teal-300 text-teal-900",
  special_starter: "bg-lime-200 text-lime-900",

  default: "bg-gray-200 text-gray-800"
};

export function getCriteriaStyle({ kind, value }) {
  if (!kind || !value) return criteriaColors.default;
  const key = `${kind.toLowerCase()}_${value.toLowerCase()}`;
  return criteriaColors[key] || criteriaColors.default;
}
