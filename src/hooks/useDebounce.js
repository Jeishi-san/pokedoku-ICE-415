// src/hooks/useDebounce.js
import { useEffect, useState } from "react";

/**
 * useDebounce
 * Returns a debounced version of the input value.
 * The debounced value updates only after the specified delay
 * without changes to the input value.
 *
 * @param {any} value - The value to debounce.
 * @param {number} delay - Delay in ms (default: 300).
 * @returns {any} - The debounced value.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // set up timer
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // clean up timer if value/delay changes or on unmount
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
