"use client";

import { useEffect, useRef } from "react";

// Generic effect cleanup utility
export function useCleanupEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList
) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up previous effect
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Run new effect
    const cleanup = effect();
    cleanupRef.current = cleanup || null;

    // Return cleanup function
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [effect, ...deps]);
}

// Effect with alive flag for async operations
export function useAliveEffect(
  effect: (isAlive: () => boolean) => void | (() => void),
  deps: React.DependencyList
) {
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;

    const cleanup = effect(() => aliveRef.current);

    return () => {
      aliveRef.current = false;
      if (cleanup) cleanup();
    };
  }, [effect, ...deps]);
}

// Effect for API calls with loading states
export function useApiEffect<T>(
  apiCall: () => Promise<T>,
  onSuccess: (data: T) => void,
  onError: (error: Error) => void,
  deps: React.DependencyList
) {
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    apiCall()
      .then(onSuccess)
      .catch(onError)
      .finally(() => {
        loadingRef.current = false;
      });
  }, [apiCall, onSuccess, onError, ...deps]);
}

// Effect for intersection observer
export function useIntersectionEffect(
  callback: () => void,
  options: {
    rootMargin?: string;
    threshold?: number | number[];
    disabled?: boolean;
    debounceMs?: number;
  } = {}
) {
  const {
    rootMargin = "0px",
    threshold = 0,
    disabled = false,
    debounceMs = 0,
  } = options;

  const nodeRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (debounceMs > 0) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(callback, debounceMs);
          } else {
            callback();
          }
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, rootMargin, threshold, disabled, debounceMs]);

  return nodeRef;
}

// Effect for resize observer
export function useResizeEffect(
  callback: (width: number, height: number) => void,
  deps: React.DependencyList
) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        callback(width, height);
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [callback, ...deps]);

  return elementRef;
}

// Effect for animation frame
export function useAnimationFrameEffect(
  callback: (time: number) => void,
  deps: React.DependencyList
) {
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = (time: number) => {
      callback(time);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [...deps]);
}

// Effect for interval
export function useIntervalEffect(
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList
) {
  useEffect(() => {
    if (delay === null) return;

    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [callback, delay, ...deps]);
}

// Effect for timeout
export function useTimeoutEffect(
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList
) {
  useEffect(() => {
    if (delay === null) return;

    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [callback, delay, ...deps]);
}

// Effect for event listeners
export function useEventListenerEffect<T extends keyof WindowEventMap>(
  event: T,
  handler: (event: WindowEventMap[T]) => void,
  deps: React.DependencyList
) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler, ...deps]);
}

// Effect for custom event listeners
export function useCustomEventListenerEffect(
  event: string,
  handler: (event: CustomEvent) => void,
  deps: React.DependencyList
) {
  useEffect(() => {
    window.addEventListener(event, handler as EventListener);
    return () => window.removeEventListener(event, handler as EventListener);
  }, [event, handler, ...deps]);
}
