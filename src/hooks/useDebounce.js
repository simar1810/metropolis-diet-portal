"use client";
import { useEffect, useState } from "react";

export default function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(function () {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay])

  return debouncedValue;
}