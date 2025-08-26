"use client"

import * as React from "react"
import { AtSign, X, HelpCircle, User } from "lucide-react"
import { OutlineImage } from "@/components/icons/Icons"
import { Button } from "@/components/ui/button"
import { Input, InputWrapper } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { useAuth } from "@/providers/AuthProvider"
import { upsertProfile, deleteAccount } from "@/app/actions/profile"
import type { UpsertProfileDTO } from "@/types/profile"
import { z } from "zod"
import { toast } from "sonner"
import Image from "next/image"
import { getAccentColorStyle, type AccentColor, getStyleFromHexShade } from "@/lib/accent-colors"
import { useUnsavedChanges } from "./Dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteAccountDialog } from "./DeleteAccountDialog"
import { supabase } from "@/lib/supabase"
import { finalizeAvatar, finalizeCover, presignAvatarUpload, presignCoverUpload } from "@/app/actions/storage"

// bio formatting not persisted yet

// Zod schemas for validation
const profileSchema = z.object({
  displayName: z.string()
    .min(3, "Display name must be at least 3 characters")
    .max(30, "Display name must be less than 30 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
})

interface ProfileProps { user: { id: string; email?: string } | null }

export function Profile({ user }: ProfileProps) {
  const { profile, refreshProfile } = useAuth()
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({})
  const [formData, setFormData] = React.useState({
    displayName: profile?.display_name ?? '',
    username: profile?.username ?? 'username',
    bio: profile?.bio ?? '',
  })

  // Update form data when user changes
  React.useEffect(() => {
    setFormData({
      displayName: profile?.display_name ?? '',
      username: profile?.username ?? 'username',
      bio: profile?.bio ?? '',
    })
  }, [profile])

  // Use the context for unsaved changes
  const { markAsSaved, markAsChanged, registerSaveFunction } = useUnsavedChanges()

  // Add handleSave function back as a regular function
  const handleSave = React.useCallback(async () => {
    // Clear previous validation errors
    setValidationErrors({})

    try {
      // Validate form data with Zod
      const validatedData = profileSchema.parse(formData)

      // Create a promise for the profile update via server action
      const payload: UpsertProfileDTO = {
        user_id: user?.id as unknown as import("@/types/db").UUID,
        username: validatedData.username.toLowerCase(),
        display_name: validatedData.displayName,
        bio: formData.bio || null,
        // nie nadpisuj cover_url ani accent_color tutaj
      }

      const updatePromise = upsertProfile(payload)

      // Show toast with promise
      toast.promise(updatePromise, {
        loading: 'Updating profile...',
        success: () => 'Profile updated successfully!',
        error: (error) => {
          console.error('Failed to update profile:', error)
          return error instanceof Error ? error.message : 'Failed to update profile'
        },
      })

      // Wait for the promise to resolve
      await updatePromise

      // Success - toast is already shown
      console.log('Profile updated successfully')

      // Mark as saved to clear unsaved changes state
      markAsSaved()
      try {
        window.dispatchEvent(new CustomEvent('profile:updated'))
        window.dispatchEvent(new CustomEvent('settings:requestClose'))
      } catch { }
      // revalidatePath wykonujemy w server action; tutaj nie musimy odswiezac routera

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message
          }
        })
        setValidationErrors(errors)
        return
      }
      console.error('Error updating profile:', error)
    }
  }, [formData, markAsSaved, user?.id])

  // context already destructured above

  // Register save function with context so toast can call it
  React.useEffect(() => {
    registerSaveFunction(handleSave)
  }, [handleSave, registerSaveFunction])

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    // Clean username to contain only valid characters (no @ needed in database)
    if (field === 'username') {
      // Remove any characters that aren't letters, numbers, or underscores
      processedValue = value.replace(/[^a-zA-Z0-9_]/g, '')
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Prosto: traktuj edycje jak zmiane bez porownywania wartosci
    markAsChanged()
  }

  // Get current accent color from user metadata for display purposes only
  const currentAccentColor = 'blue' as AccentColor
  const accentHex = profile?.accent_color || null

  return (
    <div className="space-y-6">
      {/* Presence Section - Cover and Avatar at the top like edit-profile-dialog */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avatar and Cover</h3>

        {/* Cover Image with Avatar Overlay - Layout like edit-profile-dialog */}
        <div className="relative">
          {/* Cover with same design as edit-profile-dialog - Clickable for adding image */}
          <div
            className="w-full h-48 rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={accentHex ? getStyleFromHexShade(accentHex, '100', 'backgroundColor') : getAccentColorStyle(currentAccentColor, 100, 'backgroundColor')}
            onClick={async () => {
              if (!user?.id) return;
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;
                const ext = (file.name.split('.').pop() || 'jpg').toLowerCase() as "jpg" | "jpeg" | "png" | "webp";
                const { data, error } = await presignCoverUpload(user.id, ext);
                if (!data || error) { toast.error(error || 'upload failed'); return; }
                const res = await fetch(data.url, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
                if (!res.ok) { toast.error('upload failed'); return; }
                const fin = await finalizeCover(user.id, data.path);
                if (typeof fin === 'object' && fin && 'error' in fin && (fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || 'update failed'); return; }
                await refreshProfile();
                window.dispatchEvent(new CustomEvent('profile:updated'));
              };
              input.click();
            }}
          >
            {profile?.cover_url ? (
              <Image
                src={profile.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
                width={600}
                height={192}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-3" style={accentHex ? getStyleFromHexShade(accentHex, '950', 'color') : getAccentColorStyle(currentAccentColor, 950, 'color')} >
                <OutlineImage size={42} />
                <div className="text-center mb-10">
                  <p className="text-sm mb-1 font-semibold">Cover Image</p>
                  <p className="text-xs opacity-80">Click here to add or change your cover image</p>
                </div>
              </div>
            )}
          </div>

          {/* Avatar positioned on top of cover like edit-profile-dialog */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              {/* Avatar with same design as edit-profile-dialog - Clickable for adding image */}
              <div
                className="size-28 rounded-full border-2 border-white overflow-hidden bg-white ring-3 ring-white shadow-lg cursor-pointer transition-all relative group"
                onClick={async () => {
                  if (!user?.id) return;
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase() as "jpg" | "jpeg" | "png" | "webp";
                    const { data, error } = await presignAvatarUpload(user.id, ext);
                    if (!data || error) { toast.error(error || 'upload failed'); return; }
                    const res = await fetch(data.url, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
                    if (!res.ok) { toast.error('upload failed'); return; }
                    const fin = await finalizeAvatar(user.id, data.path);
                    if (typeof fin === 'object' && fin && 'error' in fin && (fin as { error?: string }).error) { toast.error((fin as { error?: string }).error || 'update failed'); return; }
                    await refreshProfile();
                    window.dispatchEvent(new CustomEvent('profile:updated'));
                  };
                  input.click();
                }}
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username || 'User'}
                    className="w-full h-full object-cover"
                    width={112}
                    height={112}
                  />
                ) : (
                  <div
                    className="w-full h-full overflow-hidden flex items-center justify-center text-2xl font-bold"
                    style={accentHex ? getStyleFromHexShade(accentHex, '200', 'backgroundColor') : getAccentColorStyle(currentAccentColor, 200, 'backgroundColor')}
                  >
                    <User size={48} />
                    {/* hover overlay sliding from bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
                      <div className="absolute bottom-0 left-0 w-full h-1/3 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out bg-neutral-950/30" />
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <OutlineImage size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar Actions - Remove button instead of Add */}
              <div className="absolute -bottom-2 -right-2">
                {profile?.avatar_url && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white shadow-lg border-2 border-red-600 w-8 h-8"
                    onClick={() => {
                      // TODO: Implement avatar removal
                      console.log('Remove avatar clicked')
                    }}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add bottom margin to accommodate avatar overflow */}
        <div className="h-12" />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your full name or nickname"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className={validationErrors.displayName ? 'border-red-500' : ''}
            />
            {validationErrors.displayName && (
              <p className="text-sm text-red-500">{validationErrors.displayName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <InputWrapper variant={'md'}>
              <AtSign />
              <Input
                id="username"
                placeholder="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`rounded-none ${validationErrors.username ? 'border-red-500' : ''}`}
              />
            </InputWrapper>
            {validationErrors.username && (
              <p className="text-sm text-red-500">{validationErrors.username}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="bio">Bio</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <HelpCircle className="h-4 w-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="">
                  <div className="space-y-2">
                    <p className="text-sm">You can use these tags to format your bio:</p>
                    <div className="space-y-1 text-xs">
                      <p><code className="bg-primary-foreground/12 px-1 rounded">[B]bold text[/B]</code> - makes text bold</p>
                      <p><code className="bg-primary-foreground/12 px-1 rounded">[I]italic text[/I]</code> - makes text italic</p>
                      <p><code className="bg-primary-foreground/12 px-1 rounded">[U]underlined text[/U]</code> - underlines text</p>
                      <p><code className="bg-primary-foreground/12 px-1 rounded">[SPOT]highlighted text[/SPOT]</code> - highlights text with darker color</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            rows={3}
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className={validationErrors.bio ? 'border-red-500' : ''}
          />
          {validationErrors.bio && (
            <p className="text-sm text-red-500">{validationErrors.bio}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Account Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              readOnly
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Enter new password" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danger Zone</h3>
        <div className="space-y-4">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
            <p className="text-sm text-red-600 mb-3">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        expected={profile?.username || ""}
        loading={deleting}
        onConfirm={async () => {
          if (!user?.id) return;
          setDeleting(true);
          try {
            // 1) sign out first to clear local storage and sessions
            await supabase.auth.signOut();
            // 2) delete account on server
            const res = await deleteAccount(user.id);
            if ((res as { error?: string }).error) {
              toast.error(String((res as { error?: string }).error));
            } else {
              toast.success("Account deleted");
            }
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  )
}
