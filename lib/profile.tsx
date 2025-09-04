import React from "react";
import { getAccentColorStyle, type AccentColor, getStyleFromHexShade } from "./accent-colors";
import Link from "next/link";

const TOKEN_OR_NL = /(\[(?:B|I|U|SPOT)\]|\[\/(?:B|I|U|SPOT)\]|\n)/g;
const URL_RX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/g;

type BioState = { bold: boolean; italic: boolean; underline: boolean; spot: boolean };

function wrapWithState(node: React.ReactNode, st: BioState) {
  let out = node;
  if (st.bold) out = <strong>{out}</strong>;
  if (st.italic) out = <em>{out}</em>;
  if (st.underline) out = <u>{out}</u>;
  if (st.spot) out = <span className="text-neutral-950 dark:text-neutral-50">{out}</span>;
  return out;
}

// Safely render bio content with simple, controlled tags + newlines + urls
export const renderBioContent = (bio: string): React.ReactNode[] => {
  if (!bio) return [];
  const parts = bio.split(TOKEN_OR_NL);
  const st: BioState = { bold: false, italic: false, underline: false, spot: false };
  const out: React.ReactNode[] = [];
  let k = 0;

  for (const part of parts) {
    if (part == null) continue;
    switch (part) {
      case "[B]": st.bold = true; continue;
      case "[/B]": st.bold = false; continue;
      case "[I]": st.italic = true; continue;
      case "[/I]": st.italic = false; continue;
      case "[U]": st.underline = true; continue;
      case "[/U]": st.underline = false; continue;
      case "[SPOT]": st.spot = true; continue;
      case "[/SPOT]": st.spot = false; continue;
      case "\n": out.push(<br key={`br-${k++}`} />); continue;
      default: break;
    }

    if (!part) continue;

    // linkify urls inside the text chunk (React escapes by default -> safe)
    const chunkPieces = part.split(URL_RX);
    for (const piece of chunkPieces) {
      if (!piece) continue;
      if (URL_RX.test(piece)) {
        const url = piece.startsWith("http") ? piece : `https://${piece}`;
        out.push(
          <React.Fragment key={k++}>
            {wrapWithState(
              <Link href={url} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
                {piece}
              </Link>,
              st
            )}
          </React.Fragment>
        );
      } else {
        out.push(<React.Fragment key={k++}>{wrapWithState(piece, st)}</React.Fragment>);
      }
    }
  }

  return out;
};

export const getUserAccentStyles = (accentColor: AccentColor) => ({
  coverBgStyle: getAccentColorStyle(accentColor, 100, "backgroundColor"),
  avatarBgStyle: getAccentColorStyle(accentColor, 200, "backgroundColor"),
  avatarForegroundStyle: getAccentColorStyle(accentColor, 950, "color"),
} as const);

export const getUserAccentStylesFromHex = (hex: string) => ({
  coverBgStyle: getStyleFromHexShade(hex, "100", "backgroundColor"),
  avatarBgStyle: getStyleFromHexShade(hex, "200", "backgroundColor"),
  avatarForegroundStyle: getStyleFromHexShade(hex, "950", "color"),
} as const);
