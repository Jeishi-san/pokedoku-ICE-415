// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

/**
 * 🕒 useDebounce Hook
 * Smoothly delays rapid changes in a value (like search input)
 * to avoid excessive re-renders or API calls.
 *
 * @template T
 * @param {T} value - The current value to debounce.
 * @param {number} [delay=300] - Delay duration in milliseconds.
 * @returns {T} The debounced value that updates after the delay.
 *
 * 🧠 Example:
 * const debouncedSearch = useDebounce(searchTerm, 400);
 * useEffect(() => {
 *   if (debouncedSearch) fetchData(debouncedSearch);
 * }, [debouncedSearch]);
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timer for debouncing
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, Math.max(0, delay)); // ensures delay is non-negative

    // Cleanup previous timer if value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
