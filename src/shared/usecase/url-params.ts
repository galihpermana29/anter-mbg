"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/**
 * Get URL parameters from the current URL
 * @param key - Optional parameter key to retrieve a specific value
 * @returns All URL parameters as an object, or a specific parameter value if key is provided
 */
export function getUrlParams<T = Record<string, string>>(key?: string): T | string | null {
  if (typeof window === "undefined") return null;
  
  const searchParams = new URLSearchParams(window.location.search);
  
  if (key) {
    return searchParams.get(key);
  }
  
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params as T;
}

/**
 * Set or update URL parameters without refreshing the page
 * @param params - Object containing parameters to set or update
 * @param options - Configuration options
 */
export function setUrlParams(
  params: Record<string, string | number | boolean | null | undefined>,
  options: { replace?: boolean } = {}
): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }
  });
  
  const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  if (options.replace) {
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.pushState({}, "", newUrl);
  }
}

/**
 * Replace all URL parameters
 * @param params - Object containing new parameters
 * @param options - Configuration options
 */
export function replaceUrlParams(
  params: Record<string, string | number | boolean | null | undefined>,
  options: { replace?: boolean } = { replace: true }
): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });
  
  const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  if (options.replace) {
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.pushState({}, "", newUrl);
  }
}

/**
 * Remove specific URL parameters
 * @param keys - Array of parameter keys to remove
 * @param options - Configuration options
 */
export function removeUrlParams(
  keys: string[],
  options: { replace?: boolean } = {}
): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  
  keys.forEach(key => {
    searchParams.delete(key);
  });
  
  const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  if (options.replace) {
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.pushState({}, "", newUrl);
  }
}

/**
 * React hook to work with URL parameters
 * @returns Object with URL parameters and utility functions
 */
export function useUrlParams<T = Record<string, string>>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<T>({} as T);
  
  // Update params state when searchParams change
  useEffect(() => {
    const newParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      newParams[key] = value;
    });
    setParams(newParams as T);
  }, [searchParams]);
  
  // Set or update URL parameters
  const setUrlParam = useCallback(
    (key: string, value: string | number | boolean | null | undefined) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      if (value === null || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
      
      const search = newSearchParams.toString() ? `?${newSearchParams.toString()}` : "";
      router.push(`${pathname}${search}`);
    },
    [pathname, router, searchParams]
  );
  
  // Set multiple URL parameters at once
  const setUrlParams = useCallback(
    (newParams: Record<string, string | number | boolean | null | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      
      const search = newSearchParams.toString() ? `?${newSearchParams.toString()}` : "";
      router.push(`${pathname}${search}`);
    },
    [pathname, router, searchParams]
  );
  
  // Replace all URL parameters
  const replaceUrlParams = useCallback(
    (newParams: Record<string, string | number | boolean | null | undefined>) => {
      const newSearchParams = new URLSearchParams();
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          newSearchParams.set(key, String(value));
        }
      });
      
      const search = newSearchParams.toString() ? `?${newSearchParams.toString()}` : "";
      router.push(`${pathname}${search}`);
    },
    [pathname, router]
  );
  
  // Remove specific URL parameters
  const removeUrlParams = useCallback(
    (keys: string[]) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      keys.forEach(key => {
        newSearchParams.delete(key);
      });
      
      const search = newSearchParams.toString() ? `?${newSearchParams.toString()}` : "";
      router.push(`${pathname}${search}`);
    },
    [pathname, router, searchParams]
  );
  
  // Get a specific URL parameter
  const getUrlParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );
  
  return {
    params,
    setUrlParam,
    setUrlParams,
    replaceUrlParams,
    removeUrlParams,
    getUrlParam,
  };
}
