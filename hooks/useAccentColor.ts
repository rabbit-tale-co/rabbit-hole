"use client";

import { useMemo } from "react";
import { AccentColor, generateAccentColor, getAccentColorStyle } from "@/lib/accent-colors";

export function useAccentColor(userId?: string, override?: AccentColor) {
  const color = useMemo<AccentColor>(() => override ?? (userId ? generateAccentColor(userId) : "blue"), [userId, override]);
  const softBg = useMemo(() => getAccentColorStyle(color, 50, "backgroundColor"), [color]);
  const midBg  = useMemo(() => getAccentColorStyle(color, 200, "backgroundColor"), [color]);
  const boldBg = useMemo(() => getAccentColorStyle(color, 500, "backgroundColor"), [color]);
  const border = useMemo(() => getAccentColorStyle(color, 300, "borderColor"), [color]);
  const text   = useMemo(() => getAccentColorStyle(color, 700, "color"), [color]);

  return { color, softBg, midBg, boldBg, border, text };
}
