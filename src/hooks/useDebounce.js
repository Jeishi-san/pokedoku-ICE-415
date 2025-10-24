// src/hooks/useDebounce.js
import { useState, useEffect } from "react"; // <-- must be present

/**
 * Custom hook to debounce a value.
 * @param {any} value The input value
 * @param {number} delay Debounce delay in ms
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
