import React from 'react';

// Color utility functions for consistent color generation

export const ACCENT_COLORS = [
  'blue', 'green', 'purple', 'pink',
  'yellow', 'indigo', 'teal', 'orange',
  'red', 'emerald', 'cyan', 'violet',
  'amber', 'lime', 'sky', 'rose'
] as const;

export type AccentColor = typeof ACCENT_COLORS[number];

// Color palette definitions with hex values
export const COLOR_PALETTES: Record<AccentColor, Record<number, string>> = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724'
  },
  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b'
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e'
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344'
  },
  violet: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  lime: {
    50: '#f7fee7',
    100: '#ecfccb',
    200: '#d9f99d',
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
    900: '#365314',
    950: '#1a2e05'
  },
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519'
  }
};

/**
 * Generate consistent accent color based on user ID
 * @param userId - User's unique identifier
 * @returns Accent color name (e.g., 'blue', 'green', 'teal')
 */
export function generateAccentColor(userId: string): AccentColor {
  // Generate consistent color index based on user ID
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

/**
 * Generate a random accent color different from current
 * @param currentColor - Current accent color to avoid
 * @returns New random accent color
 */
export function generateRandomAccentColor(currentColor: AccentColor): AccentColor {
  // Filter out the current color to ensure we get a different one
  const availableColors = ACCENT_COLORS.filter(color => color !== currentColor);

  // Pick a random color from available ones
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex] || ACCENT_COLORS[0]; // Fallback to first color if needed
}

/**
 * Get actual color value (hex) for accent color with specific shade
 * @param color - Accent color name
 * @param shade - Color shade (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
 * @returns Hex color value (e.g., '#dbeafe')
 */
export function getAccentColorValue(color: AccentColor, shade: number): string {
  const palette = COLOR_PALETTES[color];
  if (!palette || !palette[shade]) {
    // Fallback to a default color if shade doesn't exist
    return palette?.[500] || '#6b7280'; // Default to gray-500
  }
  return palette[shade];
}

/**
 * Get CSS style object for accent color with specific shade
 * @param color - Accent color name
 * @param shade - Color shade (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
 * @param property - CSS property to apply color to ('backgroundColor', 'color', 'borderColor')
 * @returns CSS style object (e.g., { backgroundColor: '#dbeafe' })
 */
export function getAccentColorStyle(color: AccentColor, shade: number, property: 'backgroundColor' | 'color'  | 'borderColor' = 'backgroundColor'): React.CSSProperties {
  const colorValue = getAccentColorValue(color, shade);
  return { [property]: colorValue };
}

/**
 * Get Tailwind CSS class for accent color with specific shade (DEPRECATED - use getAccentColorStyle instead)
 * @param color - Accent color name
 * @param shade - Tailwind shade (100, 200, 950, etc.)
 * @returns Tailwind CSS class (e.g., 'bg-blue-100', 'text-teal-950')
 * @deprecated Use getAccentColorStyle instead for better compatibility
 */
export function getAccentColorClass(color: AccentColor, shade: number, prefix: 'bg' | 'text' | 'border' = 'bg'): string {
  console.warn('getAccentColorClass is deprecated. Use getAccentColorStyle instead.');
  return `${prefix}-${color}-${shade}`;
}

// --- HEX utilities for DB-stored accent_color ---
export function isHexColor(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^#?[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeHex(value: string): string {
  if (!value) return '#6b7280';
  return value.startsWith('#') ? value : `#${value}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const v = normalizeHex(hex).slice(1);
  const bigint = parseInt(v, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function getReadableTextColor(bgHex: string): string {
  const { r, g, b } = hexToRgb(bgHex);
  // YIQ contrast
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#111111' : '#ffffff';
}

export function getStyleFromHex(hex: string, property: 'backgroundColor' | 'color' | 'borderColor' = 'backgroundColor'): React.CSSProperties {
  return { [property]: normalizeHex(hex) } as React.CSSProperties;
}

// Try to map a base hex (typically shade 500) to one of our palettes
export function findAccentBy500Hex(baseHex: string): AccentColor | null {
  const target = normalizeHex(baseHex).toLowerCase();
  for (const name of ACCENT_COLORS) {
    const v = COLOR_PALETTES[name][500]?.toLowerCase();
    if (v === target) return name;
  }
  return null;
}

export function getPaletteShadeFromBaseHex(baseHex: string, shade: number): string | null {
  const name = findAccentBy500Hex(baseHex);
  if (!name) return null;
  const val = COLOR_PALETTES[name][shade as keyof typeof COLOR_PALETTES[AccentColor]] as unknown as string | undefined;
  return val ?? null;
}

// Basic HSL helpers for fallback shading when hex is not in our palette
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
  let h = 0, s = 0;
  const l = (max - min) / 2 + min; // not exact, but fine
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
      case g1: h = (b1 - r1) / d + 2; break;
      case b1: h = (r1 - g1) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => {
    const v = Math.round(x * 255).toString(16).padStart(2, '0');
    return v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function deriveShadeFromHex(baseHex: string, target: '100' | '200' | '950'): string {
  // If in palette, prefer exact palette shade
  const shadeNum = target === '100' ? 100 : target === '200' ? 200 : 950;
  const mapped = getPaletteShadeFromBaseHex(baseHex, shadeNum);
  if (mapped) return mapped;
  // Fallback: adjust lightness
  const { h, s, l } = hexToHsl(baseHex);
  if (target === '100') return hslToHex(h, s * 0.8, Math.min(95, l + 35));
  if (target === '200') return hslToHex(h, s * 0.9, Math.min(90, l + 25));
  // 950 -> darker text-like color
  return hslToHex(h, Math.min(100, s * 1.1), Math.max(7, l * 0.2));
}

export function getStyleFromHexShade(baseHex: string, target: '100' | '200' | '950', property: 'backgroundColor' | 'color' | 'borderColor' = 'backgroundColor'): React.CSSProperties {
  const v = deriveShadeFromHex(baseHex, target);
  return { [property]: v } as React.CSSProperties;
}
