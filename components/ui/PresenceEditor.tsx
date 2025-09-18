"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  OutlineClose,
  OutlineImage,
  OutlineUser,
} from "@/components/icons/Icons";
import {
  getAccentColorStyle,
  getStyleFromHexShade,
} from "@/lib/accent-colors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PresenceEditor({
  coverUrl,
  avatarUrl,
  accentHex,
  currentAccentColor = "blue",
  onPickCover,
  onPickAvatar,
  onRemoveCover,
  onRemoveAvatar,
  uploadingCover = false,
  uploadingAvatar = false,
}: {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  accentHex?: string | null;
  currentAccentColor?: string;
  onPickCover: () => void;
  onPickAvatar: () => void;
  onRemoveCover: () => void;
  onRemoveAvatar: () => void;
  uploadingCover?: boolean;
  uploadingAvatar?: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Avatar and Cover</h3>

      {/* Cover Image with Avatar Overlay - identical to profile editor */}
      <div className="relative">
        <div
          className="group/cover relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer"
          style={
            accentHex
              ? getStyleFromHexShade(accentHex, "100", "backgroundColor")
              : getAccentColorStyle(currentAccentColor as any, 100, "backgroundColor")
          }
          onClick={() => onPickCover()}
        >
          {coverUrl ? (
            <Image
              key={coverUrl}
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
              width={600}
              height={192}
              unoptimized={coverUrl.toLowerCase().endsWith(".gif")}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full space-y-3"
              style={
                accentHex
                  ? getStyleFromHexShade(accentHex, "950", "color")
                  : getAccentColorStyle(currentAccentColor as any, 950, "color")
              }
            >
              <OutlineImage size={42} />
              <div className="text-center mb-10">
                <p className="text-sm mb-1 font-semibold">Cover Image</p>
                <p className="text-xs opacity-80">Click here to add or change your cover image</p>
              </div>
            </div>
          )}

          {/* Remove cover button with tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Remove cover"
                  size="icon"
                  variant="destructive"
                  className="absolute size-8 top-2 right-2 z-10 opacity-0 group-hover/cover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); onRemoveCover(); }}
                >
                  <OutlineClose />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                Remove cover
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Avatar positioned on top of cover like profile editor */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative group/avatar">
            <div
              className="size-28 rounded-full overflow-hidden bg-white ring-4 ring-white dark:ring-black shadow-lg cursor-pointer transition-all relative"
              onClick={() => onPickAvatar()}
            >
              {avatarUrl ? (
                <Image
                  key={avatarUrl}
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  width={112}
                  height={112}
                  unoptimized={avatarUrl.toLowerCase().endsWith(".gif")}
                />
              ) : (
                <div
                  className="w-full h-full overflow-hidden flex items-center justify-center text-2xl font-bold"
                  style={
                    accentHex
                      ? getStyleFromHexShade(accentHex, "200", "backgroundColor")
                      : getAccentColorStyle(currentAccentColor as any, 200, "backgroundColor")
                  }
                >
                  <OutlineUser size={48} />
                  {/* hover overlay from profile editor */}
                  <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
                    <div className="absolute bottom-0 left-0 w-full h-1/3 translate-y-full group-hover/avatar:translate-y-0 transition-transform duration-200 ease-out bg-neutral-950/30" />
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                      <OutlineImage size={24} className="text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating remove button over avatar */}
            {avatarUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label="Remove avatar"
                      size="icon"
                      variant="destructive"
                      className="absolute size-8 -bottom-1.5 -right-1.5 z-50 opacity-0 group-hover/avatar:opacity-100 focus:opacity-100 transition-opacity"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveAvatar(); }}
                    >
                      <OutlineClose />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Remove avatar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      {/* Spacer under avatar overlap */}
      <div className="h-12" />
    </div>
  );
}
