"use client";

import { useEffect, useRef } from "react";

export function useIntersection(onHit: () => void, rootMargin = "800px") {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((ents) => ents.forEach(e => e.isIntersecting && onHit()), { root: null, rootMargin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [onHit, rootMargin]);
  return ref;
}
