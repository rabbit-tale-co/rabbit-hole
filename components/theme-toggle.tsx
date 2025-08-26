"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type ThemeId = "light" | "dark" | "system"

const opts = [
  { id: "light" as ThemeId, label: "Light", icon: Sun, hint: "Bright & clean" },
  { id: "dark" as ThemeId, label: "Dark", icon: Moon, hint: "Easy on eyes" },
  { id: "system" as ThemeId, label: "System", icon: Monitor, hint: "Follow OS" },
]

/**
 * SettingsThemeRow
 * Two-column row: label/description on the left, compact segmented control on the right.
 * Sized for dialogs; keeps the whole settings sheet calm and consistent.
 */
export function SettingsThemeRow({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="sm:pr-6">
          <div className="text-sm font-medium">Appearance</div>
          <div className="text-xs text-muted-foreground">
            Light, Dark or System default.
          </div>
        </div>
        <div className="flex justify-start sm:justify-end">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-1">
            <div className="px-3 py-2 h-9 gap-2 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const current = (theme ?? resolvedTheme ?? "system") as ThemeId

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      {/* left: label/desc mirrors the dialog's text rhythm */}
      <div className="sm:pr-6">
        <div className="text-sm font-medium">Appearance</div>
        <div className="text-xs text-muted-foreground">
          Light, Dark or System default.
        </div>
      </div>

      {/* right: segmented control */}
      <div className="flex justify-start sm:justify-end">
        <ToggleGroup
          type="single"
          value={current}
          onValueChange={(v) => v && setTheme(v as ThemeId)}
          className={cn(
            "rounded-lg border border-border/70 bg-muted/30",
            "p-1"
          )}
        >
          <TooltipProvider delayDuration={200}>
            {opts.map(o => (
              <Tooltip key={o.id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value={o.id}
                    aria-label={o.label}
                    variant={'default'}
                    className={cn(
                      "data-[state=on]:shadow-sm",
                      "px-3 py-2 h-9 gap-2 rounded-md",
                      "text-xs text-muted-foreground",
                      "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    )}
                  >
                    <o.icon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{o.label}</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom">{o.hint}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </ToggleGroup>
      </div>
    </div>
  )
}
