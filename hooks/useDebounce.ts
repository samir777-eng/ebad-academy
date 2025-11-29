import { useEffect, useState } from "react";

/**
 * Custom hook for debouncing values
 * Delays updating the debounced value until after the specified delay
 * Useful for search inputs to reduce API calls and re-renders
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchText, setSearchText] = useState("");
 * const debouncedSearch = useDebounce(searchText, 300);
 * 
 * // debouncedSearch will only update 300ms after user stops typing
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

