import React from "react";
import { getAccentColorStyle, type AccentColor } from "./accent-colors";

const TOKEN_REGEX = /(\[(?:B|I|U|SPOT)\]|\[\/(?:B|I|U|SPOT)\])/;

// Safely render bio content with simple, controlled tags
export const renderBioContent = (bio: string): React.ReactNode[] => {
  if (!bio) return [];
  const parts = bio.split(TOKEN_REGEX);
  const result: React.ReactNode[] = [];

  const state = { bold: false, italic: false, underline: false, spot: false };
  let key = 0;

  for (const part of parts) {
    if (!part) continue;
    switch (part) {
      case '[B]': state.bold = true; continue;
      case '[/B]': state.bold = false; continue;
      case '[I]': state.italic = true; continue;
      case '[/I]': state.italic = false; continue;
      case '[U]': state.underline = true; continue;
      case '[/U]': state.underline = false; continue;
      case '[SPOT]': state.spot = true; continue;
      case '[/SPOT]': state.spot = false; continue;
      default: break;
    }

    if (!part.trim()) continue;

    let node: React.ReactNode = part;
    if (state.bold) node = <strong>{node}</strong>;
    if (state.italic) node = <em>{node}</em>;
    if (state.underline) node = <u>{node}</u>;
    if (state.spot) node = <span className="text-neutral-950 dark:text-neutral-50">{node}</span>;

    result.push(<React.Fragment key={key++}>{node}</React.Fragment>);
  }

  return result;
};

export const getUserAccentStyles = (accentColor: AccentColor) => ({
  coverBgStyle: getAccentColorStyle(accentColor, 100, 'backgroundColor'),
  avatarBgStyle: getAccentColorStyle(accentColor, 200, 'backgroundColor'),
  avatarForegroundStyle: getAccentColorStyle(accentColor, 950, 'color'),
} as const);
