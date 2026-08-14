"use client";
import { useCallback, useEffect, useState } from "react";

export function useCachedResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  deps: unknown[],
  fallback: T
) {
  const [data, setData] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      localStorage.setItem(key, JSON.stringify(result));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, refresh };
}
