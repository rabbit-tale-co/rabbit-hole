"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

// Hook for intersection observer functionality
export function useIntersection(
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

  const [node, setNode] = useState<HTMLElement | null>(null);
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up intersection observer
  useEffect(() => {
    if (!node || disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (debounceMs > 0) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
              callbackRef.current();
            }, debounceMs);
          } else {
            callbackRef.current();
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [node, rootMargin, threshold, disabled, debounceMs]);

  return setNode;
}

// Hook for animation state management
export function useAnimationState(animateGate: boolean = false) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animateValue, setAnimateValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  const resetAnimation = useCallback(() => {
    hasAnimatedRef.current = false;
    setShouldAnimate(false);
    setAnimateValue(0);
  }, []);

  const triggerAnimation = useCallback((value: number) => {
    if (animateGate && !hasAnimatedRef.current) {
      const el = containerRef.current;
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            hasAnimatedRef.current = true;
            setShouldAnimate(true);
            setTimeout(() => {
              setAnimateValue(value);
            }, 100);
            obs.disconnect();
          }
        },
        {
          threshold: 0.6,
          rootMargin: '0px'
        }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }
  }, [animateGate]);

  return {
    shouldAnimate,
    animateValue,
    setAnimateValue,
    containerRef,
    resetAnimation,
    triggerAnimation,
  };
}

// Hook for form validation and unsaved changes
export function useFormState<T extends Record<string, unknown>>(
  initialData: T,
  validationSchema?: z.ZodSchema<T>
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field as string]) {
      setValidationErrors(prev => ({ ...prev, [field as string]: '' }));
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
  }, [validationErrors]);

  const validateForm = useCallback(() => {
    if (!validationSchema) return { isValid: true, errors: {} };

    try {
      const validatedData = validationSchema.parse(formData);
      setValidationErrors({});
      return { isValid: true, errors: {}, data: validatedData };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        const errors: Record<string, string> = {};
        if ('issues' in error && Array.isArray(error.issues)) {
          error.issues.forEach((issue: unknown) => {
            if (issue && typeof issue === 'object' && 'path' in issue && 'message' in issue) {
              if (Array.isArray(issue.path) && issue.path[0]) {
                errors[issue.path[0] as string] = issue.message as string;
              }
            }
          });
        }
        setValidationErrors(errors);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: 'Validation error' } };
    }
  }, [formData, validationSchema]);

  const resetForm = useCallback((newData?: T) => {
    setFormData(newData || initialData);
    setValidationErrors({});
    setHasUnsavedChanges(false);
  }, [initialData]);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    formData,
    validationErrors,
    hasUnsavedChanges,
    isSubmitting,
    updateField,
    validateForm,
    resetForm,
    markAsSaved,
    setIsSubmitting,
  };
}

// Hook for smooth scrolling
export function useSmoothScroll() {
  const smoothScrollTo = useCallback((href: string, e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href || !href.startsWith('#')) return;
    e?.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    }
  }, []);

  return { smoothScrollTo };
}

// Hook for active section tracking (for legal pages)
export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { root: null, rootMargin: '-30% 0px -60% 0px', threshold: [0, 1] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

// Hook for container width tracking
export function useContainerWidth(forceUpdate?: number) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const readWidth = () => {
      const w = el.getBoundingClientRect().width || el.clientWidth || 0;
      if (w > 0) {
        setContainerWidth(w);
        // Force a re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('container-resize', { detail: { width: w } }));
      }
    };

    const raf = requestAnimationFrame(() => readWidth());
    const ro = new ResizeObserver(() => {
      // Use RAF to ensure DOM has updated
      requestAnimationFrame(readWidth);
    });
    ro.observe(el);

    // Also listen for window resize events as backup with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(readWidth, 100);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Also listen for orientation changes on mobile devices
    const handleOrientationChange = () => {
      // Set transitioning state to prevent jarring updates
      setIsTransitioning(true);

      // Wait for viewport to stabilize after orientation change
      let attempts = 0;
      const maxAttempts = 10;
      const checkStable = () => {
        attempts++;
        const currentWidth = el.getBoundingClientRect().width;

        if (currentWidth > 0 && attempts >= 3) {
          // Viewport seems stable, update width
          readWidth();
          // Clear transitioning state after update
          setTimeout(() => setIsTransitioning(false), 200);
        } else if (attempts < maxAttempts) {
          // Still stabilizing, check again
          setTimeout(checkStable, 50);
        } else {
          // Fallback: force update after max attempts
          readWidth();
          setTimeout(() => setIsTransitioning(false), 200);
        }
      };

      // Start checking after initial delay
      setTimeout(checkStable, 100);
    };
    window.addEventListener("orientationchange", handleOrientationChange, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [forceUpdate]);

  return { containerWidth, rootRef, isTransitioning };
}

// Hook for hover slideshow functionality
export function useHoverSlideshow(images: string[], duration = 1500) {
  const [hovered, setHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!hovered || images.length <= 1) {
      setProgress(0);
      return;
    }

    let intervalId: NodeJS.Timeout;
    let startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progressPercent = Math.min(100, (elapsed / duration) * 100);
      setProgress(progressPercent);

      if (progressPercent >= 100) {
        // Move to next image and reset
        setCurrentIndex((i) => (i + 1) % images.length);
        setProgress(0);
        startTime = performance.now(); // Reset start time for next image
      }
    };

    intervalId = setInterval(animate, 16); // ~60fps
    return () => clearInterval(intervalId);
  }, [hovered, images.length, duration]);

  // Reset when mouse leaves
  useEffect(() => {
    if (!hovered) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [hovered]);

  return {
    hovered,
    setHovered,
    currentIndex,
    progress,
  };
}

// Hook for media dimensions probing
export function useMediaDimensions() {
  const probeDimensions = useCallback(async (file: File, kind: 'image' | 'gif' | 'video'): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      if (kind === 'video') {
        let url = '';
        try { url = URL.createObjectURL(file); } catch { /* noop */ }
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => {
          const width = v.videoWidth || 1;
          const height = v.videoHeight || 1;
          resolve({ width, height });
          try { if (url) { URL.revokeObjectURL(url); } } catch { }
        };
        v.onerror = () => {
          resolve({ width: 1, height: 1 });
          try { if (url) { URL.revokeObjectURL(url); } } catch { }
        };
        v.src = url;
        return;
      }

      // Images/GIFs
      let url = '';
      try { url = URL.createObjectURL(file); } catch { /* noop */ }
      const imgEl = new window.Image();
      imgEl.onload = () => {
        const width = imgEl.naturalWidth || 1;
        const height = imgEl.naturalHeight || 1;
        resolve({ width, height });
        try { if (url) { URL.revokeObjectURL(url); } } catch { }
      };
      imgEl.onerror = () => {
        resolve({ width: 1, height: 1 });
        try { if (url) { URL.revokeObjectURL(url); } } catch { }
      };
      imgEl.src = url;
    });
  }, []);

  return { probeDimensions };
}
