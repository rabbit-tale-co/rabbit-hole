"use client";

import { useEffect, useRef } from "react";

type Opts = {
  root?: Element | null;
  rootMargin?: string;        // np. "1000px 0px 600px 0px"
  threshold?: number | number[];
  disabled?: boolean;         // wygasza obserwację (np. gdy loading)
  debounceMs?: number;        // domyślnie 60ms
};

export function useIntersection(onHit: () => void, opts?: Opts) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onHitRef = useRef(onHit);
  const intersectingRef = useRef(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => { onHitRef.current = onHit; }, [onHit]);

  useEffect(() => {
    if (opts?.disabled) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const now = entry.isIntersecting && entry.intersectionRatio > 0;

        // trigger tylko na zboczu narastającym
        if (now && !intersectingRef.current) {
          if (tRef.current) window.clearTimeout(tRef.current);
          tRef.current = window.setTimeout(
            () => onHitRef.current(),
            opts?.debounceMs ?? 60
          );
        }
        intersectingRef.current = now;
      },
      {
        root: opts?.root ?? null,
        rootMargin: opts?.rootMargin ?? "1000px 0px 600px 0px", // prefetch zanim user dojedzie na dół
        threshold: opts?.threshold ?? 0,
      }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, [opts?.root, opts?.rootMargin, opts?.threshold, opts?.disabled, opts?.debounceMs]);

  return ref;
}
