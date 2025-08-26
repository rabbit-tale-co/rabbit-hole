"use client"

import * as React from "react"
// icons available if needed: Moon, Sun, Monitor
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/AuthProvider"
import { generateAccentColor, generateRandomAccentColor, ACCENT_COLORS, getAccentColorStyle, type AccentColor, getAccentColorValue, findAccentBy500Hex } from "@/lib/accent-colors"
import { useCallback } from "react"
import { toast } from "sonner"
// import { useTheme } from "next-themes"
import { SettingsThemeRow } from "@/components/theme-toggle"
import { upsertProfile } from "@/app/actions/profile"

export function Appearance() {
  const { user: auth_user, profile } = useAuth()
  // const { setTheme } = useTheme()

  // Local state for accent color to handle updates
  const [localAccentColor, setLocalAccentColor] = React.useState<AccentColor>(() => generateAccentColor(auth_user?.id || ''))

  // Update local accent color only when user metadata changes
  React.useEffect(() => {
    if (profile?.accent_color) {
      const mapped = findAccentBy500Hex(profile.accent_color)
      if (mapped) {
        setLocalAccentColor(mapped)
        return
      }
    }
    setLocalAccentColor(generateAccentColor(auth_user?.id || ''))
  }, [auth_user?.id, profile?.accent_color])

  // Get current accent color from local state
  const currentAccentColor = localAccentColor

  // Function to update accent color
  const handleUpdateAccentColor = useCallback(async (newColor?: AccentColor) => {
    // If no color provided, generate a random one different from current
    const colorToUse = newColor || generateRandomAccentColor(currentAccentColor)
    console.log('🎨 Updating accent color:', { current: currentAccentColor, new: colorToUse })

    try {
      // Persist as HEX in DB via server action
      if (!profile) throw new Error('No profile loaded')
      const hex = getAccentColorValue(colorToUse, 500)
      const res = await upsertProfile({
        user_id: (profile.user_id as unknown) as import("@/types/db").UUID,
        username: profile.username,
        display_name: profile.display_name,
        accent_color: hex,
        cover_url: profile.cover_url ?? null,
      })
      if (typeof res === 'object' && res && 'error' in res && (res as { error?: string }).error) throw new Error((res as { error?: string }).error || 'update failed')
      setLocalAccentColor(colorToUse)
      toast.success(`Accent color updated to ${colorToUse}!`)
    } catch (error) {
      console.error('❌ Error updating accent color:', error)
      toast.error('Failed to update accent color')
    }
  }, [currentAccentColor, profile])

  // Prevent automatic color updates - only update when explicitly called
  const handleColorChange = useCallback((newColor: AccentColor) => {
    console.log('🎯 handleColorChange called with:', newColor)
    console.log('🎯 currentAccentColor:', currentAccentColor)

    if (newColor !== currentAccentColor) {
      console.log('🎯 Calling handleUpdateAccentColor...')
      handleUpdateAccentColor(newColor)
    } else {
      console.log('🎯 No change detected, skipping update')
    }
  }, [currentAccentColor, handleUpdateAccentColor])

  // Function to handle theme change
  // Example: const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'system') => { setTheme(newTheme); toast.success(`Theme changed to ${newTheme}!`) }, [setTheme])

  // CSS for dynamic ring colors and hiding default radio indicators
  const ringColorStyle = `
    [data-selected="true"][data-color="blue"] { --tw-ring-color: #1e40af; }
    [data-selected="true"][data-color="green"] { --tw-ring-color: #166534; }
    [data-selected="true"][data-color="purple"] { --tw-ring-color: #6b21a8; }
    [data-selected="true"][data-color="pink"] { --tw-ring-color: #9d174d; }
    [data-selected="true"][data-color="yellow"] { --tw-ring-color: #92400e; }
    [data-selected="true"][data-color="indigo"] { --tw-ring-color: #3730a3; }
    [data-selected="true"][data-color="teal"] { --tw-ring-color: #115e59; }
    [data-selected="true"][data-color="orange"] { --tw-ring-color: #9a3412; }
    [data-selected="true"][data-color="red"] { --tw-ring-color: #991b1b; }
    [data-selected="true"][data-color="emerald"] { --tw-ring-color: #064e3b; }
    [data-selected="true"][data-color="cyan"] { --tw-ring-color: #164e63; }
    [data-selected="true"][data-color="violet"] { --tw-ring-color: #581c87; }
    [data-selected="true"][data-color="amber"] { --tw-ring-color: #92400e; }
    [data-selected="true"][data-color="lime"] { --tw-ring-color: #365314; }
    [data-selected="true"][data-color="sky"] { --tw-ring-color: #0c4a6e; }
    [data-selected="true"][data-color="rose"] { --tw-ring-color: #881337; }

    /* Hide default radio indicators */
    [data-slot="radio-group-indicator"] {
      display: none !important;
    }

    /* Ensure our text is visible */
    [data-color] span {
      display: block !important;
      z-index: 10;
    }
  `;

  return (
    <>
      <style>{ringColorStyle}</style>
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Theme</h3>
          <p className="text-sm text-gray-600 mb-3">Choose your preferred theme for the application</p>
          <SettingsThemeRow />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Accent Color</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-2">Choose your preferred accent color for profile elements</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_COLORS.map((color: AccentColor) => {
                const isSelected = currentAccentColor === color

                return (
                  <Button
                    key={color}
                    size={'lg'}
                    onClick={() => handleColorChange(color)}
                    className={`rounded-lg ring-2 ring-offset-2 ring-offset-white transition-all duration-200 flex items-center justify-center ${isSelected
                      ? 'ring-opacity-100'
                      : 'ring-transparent hover:ring-opacity-30'
                      }`}
                    style={getAccentColorStyle(color, 200, 'backgroundColor')}
                    data-selected={isSelected}
                    data-color={color}
                  >
                    <span
                      className="text-sm capitalize drop-shadow-sm"
                      style={getAccentColorStyle(color, 950, 'color')}
                    >
                      {color}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Display</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Reduce spacing between elements
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Show Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth transitions and animations
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
