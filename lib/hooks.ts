"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import type { Bug } from "./domain/types";
import {
  parseFilters,
  writeFilters,
  type BugFilters,
} from "./domain/filters";

export interface BugsResponse {
  bugs: Bug[];
  serverTime: string;
}

export function useBugs() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<BugsResponse>("/api/bugs");

  return {
    bugs: data?.bugs ?? [],
    serverTime: data?.serverTime ?? null,
    isLoading,
    isValidating,
    error: error as Error | undefined,
    refresh: mutate,
  };
}

export function useBugFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = searchParams.toString();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(query)),
    [query],
  );

  const setFilters = useMemo(
    () => (next: BugFilters) => {
      const params = writeFilters(new URLSearchParams(query), next);
      const serialized = params.toString();
      router.replace(
        serialized ? `${pathname}?${serialized}` : pathname,
        { scroll: false },
      );
    },
    [pathname, query, router],
  );

  const reset = useMemo(
    () => () => {
      const params = new URLSearchParams(query);
      for (const key of [
        "q",
        "severity",
        "effort",
        "category",
        "status",
        "quadrant",
      ]) {
        params.delete(key);
      }
      const serialized = params.toString();
      router.replace(
        serialized ? `${pathname}?${serialized}` : pathname,
        { scroll: false },
      );
    },
    [pathname, query, router],
  );

  return { filters, setFilters, reset };
}

export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}
