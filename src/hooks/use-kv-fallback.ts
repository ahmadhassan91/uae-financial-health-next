import { useState, useEffect } from 'react';

/**
 * Fallback useKV hook for production builds where @github/spark is not available
 * Uses localStorage for persistence
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(`kv:${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`kv:${key}`, JSON.stringify(value));
    } catch {
      // localStorage not available or full
    }
  }, [key, value]);

  const setValueWrapper = (newValue: T | ((current: T) => T)) => {
    if (typeof newValue === 'function') {
      setValue(current => {
        const result = (newValue as (current: T) => T)(current);
        return result;
      });
    } else {
      setValue(newValue);
    }
  };

  const deleteValue = () => {
    try {
      localStorage.removeItem(`kv:${key}`);
      setValue(defaultValue);
    } catch {
      // localStorage not available
    }
  };

  return [value, setValueWrapper, deleteValue];
}