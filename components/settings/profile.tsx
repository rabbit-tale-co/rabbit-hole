"use client"

import * as React from "react"
import { AtSign, CropIcon, HelpCircle, RotateCcwIcon, User, X } from "lucide-react"
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
import { ImageCrop, ImageCropApply, ImageCropContent, ImageCropReset } from "@/components/ui/kibo-ui/image-crop"
import type { PixelCrop } from "react-image-crop"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteAccountDialog } from "./DeleteAccountDialog"
import { supabase } from "@/lib/supabase"
import { useProfileMedia } from "@/hooks/useProfileMedia"

// bio formatting not persisted yet

// Zod schemas for validation
const canon = (v: unknown) =>
  typeof v === "string" ? v.normalize("NFC").replace(/\r\n/g, "\n").trim() : v;
type DirtyShape = { displayName: string; username: string; bio: string };
const toCanonSnapshot = (f: { displayName: string; username: string; bio?: string }): DirtyShape => ({
  displayName: canon(f.displayName) as string,
  username: canon(f.username) as string,
  bio: canon(f.bio ?? "") as string,
});
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
    email: user?.email || '',
  })
  const [pwdCurrent, setPwdCurrent] = React.useState("")
  const [pwdNew, setPwdNew] = React.useState("")
  const [pwdConfirm, setPwdConfirm] = React.useState("")
  const [pwdLoading, setPwdLoading] = React.useState(false)

  // Use the context for unsaved changes
  const { markAsSaved, registerSaveFunction, resetChanges, checkForChanges } = useUnsavedChanges()

  // Update form data when user changes
  const baselineKeyRef = React.useRef<string>("");
  React.useEffect(() => {
    const snapshot = {
      displayName: profile?.display_name ?? '',
      username: profile?.username ?? 'username',
      bio: profile?.bio ?? '',
      email: user?.email || '',
    };
    const key = JSON.stringify(toCanonSnapshot(snapshot));
    if (baselineKeyRef.current === key) return;
    baselineKeyRef.current = key;
    setFormData(snapshot);
    // Initialize dialog as "no changes" on open (one-time per baseline change)
    try {
      resetChanges?.();
      checkForChanges?.(toCanonSnapshot(snapshot));
      markAsSaved?.();
    } catch { }
  }, [profile?.display_name, profile?.username, profile?.bio, user?.email, resetChanges, checkForChanges, markAsSaved])


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

      // update email first if changed
      if (formData.email && user?.email && formData.email.trim() !== user.email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: formData.email.trim() })
        if (emailErr) throw emailErr
        try { await supabase.auth.refreshSession() } catch { }
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

      // After save, set current canonical values as new baseline
      const canonNow = toCanonSnapshot({
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
      })
      try {
        checkForChanges?.(canonNow)
        markAsSaved?.()
        baselineKeyRef.current = JSON.stringify(canonNow)
      } catch { }
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
  }, [formData, markAsSaved, user?.id, user?.email, checkForChanges])

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

    const nextForm = { ...formData, [field]: processedValue }
    setFormData(nextForm)

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Recompute unsaved-changes state vs initial snapshot using canonical values
    try {
      checkForChanges?.(toCanonSnapshot({
        displayName: nextForm.displayName,
        username: nextForm.username,
        bio: nextForm.bio,
      }))
    } catch { /* noop */ }
  }

  // Get current accent color from user metadata for display purposes only
  const currentAccentColor = 'blue' as AccentColor
  const accentHex = profile?.accent_color || null
  const { removeCoverSafely, removeAvatarSafely, uploadAvatarFromCropped, uploadCoverFromCropped, uploadGifAvatarWithCrop, uploadGifCoverWithCrop } = useProfileMedia(user?.id || null, refreshProfile)
  const [cropAvatarFile, setCropAvatarFile] = React.useState<File | null>(null)
  const [cropCoverFile, setCropCoverFile] = React.useState<File | null>(null)
  const [cropping, setCropping] = React.useState<"avatar" | "cover" | "avatar-gif" | "cover-gif" | null>(null)
  const [gifNatDims, setGifNatDims] = React.useState<{ w: number; h: number } | null>(null)
  const [gifPixelCrop, setGifPixelCrop] = React.useState<PixelCrop | null>(null)

  const prepareGifCrop = async (file: File, kind: "avatar" | "cover") => {
    // compute natural dimensions
    const url = URL.createObjectURL(file)
    await new Promise<void>((resolve) => {
      const im = new window.Image()
      im.onload = () => { setGifNatDims({ w: im.naturalWidth || im.width, h: im.naturalHeight || im.height }); try { URL.revokeObjectURL(url) } catch { } resolve() }
      im.onerror = () => { try { URL.revokeObjectURL(url) } catch { } resolve() }
      im.src = url
    })
    if (kind === "avatar") { setCropAvatarFile(file); setCropping("avatar-gif") } else { setCropCoverFile(file); setCropping("cover-gif") }
  }

  return (
    <div className="space-y-6">
      {/* Presence Section - Cover and Avatar at the top like edit-profile-dialog */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avatar and Cover</h3>

        {/* Cover Image with Avatar Overlay - Layout like edit-profile-dialog */}
        <div className="relative">
          {/* Cover with same design as edit-profile-dialog - Clickable for adding image */}
          <div
            className="group/cover relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer"
            style={accentHex ? getStyleFromHexShade(accentHex, '100', 'backgroundColor') : getAccentColorStyle(currentAccentColor, 100, 'backgroundColor')}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async () => {
                const f = input.files?.[0] || null;
                if (!f) return;
                const nameExt = (f.name.split('.').pop() || '').toLowerCase();
                const isGif = (f.type || '').toLowerCase() === 'image/gif' || nameExt === 'gif';
                if (isGif) {
                  if (!profile?.is_premium) {
                    toast.error('GIF cover is available only for Golden Carrot', {});
                    return;
                  }
                  await prepareGifCrop(f, 'cover');
                  return;
                }
                setCropCoverFile(f);
                setCropping('cover');
              };
              input.click();
            }}
          >
            {profile?.cover_url ? (
              <>
                {/\.webm(\?|#|$)/i.test(profile.cover_url) ? (
                  <video key={profile.cover_url} src={profile.cover_url} className="w-full h-full object-cover" muted playsInline autoPlay loop />
                ) : (
                  <Image
                    key={profile.cover_url}
                    src={profile.cover_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    width={600}
                    height={192}
                    unoptimized={profile.cover_url.toLowerCase().endsWith('.gif')}
                  />
                )}
                {/* Remove cover button with tooltip (visible on hover/focus) */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Remove cover"
                        size="icon"
                        variant="destructive"
                        className="absolute size-8 top-2 right-2 z-10 opacity-0 group-hover/cover:opacity-100 focus:opacity-100 transition-opacity"
                        onClick={async (e) => { e.stopPropagation(); await removeCoverSafely(); }}
                      >
                        <X className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" align="center">Remove cover</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
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
            <div className="relative group/avatar">
              {/* Avatar with same design as edit-profile-dialog - Clickable for adding image */}
              <div
                className="size-28 rounded-full border-2 border-white overflow-hidden bg-white ring-3 ring-white shadow-lg cursor-pointer transition-all relative"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async () => {
                    const f = input.files?.[0] || null;
                    if (!f) return;
                    const nameExt = (f.name.split('.').pop() || '').toLowerCase();
                    const isGif = (f.type || '').toLowerCase() === 'image/gif' || nameExt === 'gif';
                    if (isGif) {
                      if (!profile?.is_premium) {
                        toast.error('GIF avatar is available only for Golden Carrot', {});
                        return;
                      }
                      await prepareGifCrop(f, 'avatar');
                      return;
                    }
                    setCropAvatarFile(f);
                    setCropping('avatar');
                  };
                  input.click();
                }}
              >
                {profile?.avatar_url ? (
                  (/\.webm(\?|#|$)/i.test(profile.avatar_url)) ? (
                    <video key={profile.avatar_url} src={profile.avatar_url} className="w-full h-full object-cover" muted playsInline autoPlay loop />
                  ) : (
                    <Image
                      key={profile.avatar_url}
                      src={profile.avatar_url}
                      alt={profile.username || 'User'}
                      className="w-full h-full object-cover"
                      width={112}
                      height={112}
                      unoptimized={profile.avatar_url.toLowerCase().endsWith('.gif')}
                    />
                  )
                ) : (
                  <div
                    className="w-full h-full overflow-hidden flex items-center justify-center text-2xl font-bold"
                    style={accentHex ? getStyleFromHexShade(accentHex, '200', 'backgroundColor') : getAccentColorStyle(currentAccentColor, 200, 'backgroundColor')}
                  >
                    <User size={48} />
                    {/* hover overlay sliding from bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
                      <div className="absolute bottom-0 left-0 w-full h-1/3 translate-y-full group-hover/avatar:translate-y-0 transition-transform duration-200 ease-out bg-neutral-950/30" />
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                        <OutlineImage size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating remove button as sibling over avatar (better z-index/overflow) */}
              {profile?.avatar_url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        aria-label="Remove avatar"
                        size="icon"
                        variant="destructive"
                        className="absolute size-8 -bottom-1.5 -right-1.5 z-50 opacity-0 group-hover/avatar:opacity-100 focus:opacity-100 transition-opacity"
                        onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await removeAvatarSafely(); }}
                      >
                        <X className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">Remove avatar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Add bottom margin to accommodate avatar overflow */}
        <div className="h-12" />
      </div>

      <Separator />
      {/* Crop Modal rendered via portal to avoid nesting dialog-in-dialog */}
      <Dialog open={!!cropping} onOpenChange={(open) => { if (!open) { setCropping(null); setCropAvatarFile(null); setCropCoverFile(null); } }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader className="flex flex-row w-full items-center justify-between">
            <DialogTitle>{cropping === 'avatar' ? 'Crop avatar' : 'Crop cover'}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="size-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          {(cropping === 'avatar' || cropping === 'avatar-gif') && cropAvatarFile && (
            <ImageCrop
              aspect={1}
              circularCrop
              file={cropAvatarFile}
              maxImageSize={1024 * 1024}
              onComplete={(px) => { try { setGifPixelCrop(px) } catch { } }}
              onCrop={async (dataUrl) => {
                if (cropping === 'avatar') {
                  await uploadAvatarFromCropped(dataUrl)
                }
              }}
            >
              <ImageCropContent className="max-w-full" />
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="mt-3 flex items-center gap-2 w-full">
                  <Button variant="ghost" onClick={() => { setCropping(null); setCropAvatarFile(null); }}>Cancel</Button>
                </div>
                <ImageCropReset>
                  <RotateCcwIcon className="size-4" />
                  Restart
                </ImageCropReset>
                {cropping === 'avatar' ? (
                  <ImageCropApply>
                    <CropIcon className="size-4" />
                    Crop
                  </ImageCropApply>
                ) : (
                  <ImageCropApply onClick={async () => {
                    try {
                      if (!gifPixelCrop || !gifNatDims || !cropAvatarFile) return
                      const el = document.querySelector('img[alt="crop"]') as HTMLImageElement | null
                      const renderW = el?.width || gifNatDims.w
                      const renderH = el?.height || gifNatDims.h
                      const natW = el?.naturalWidth || gifNatDims.w
                      const natH = el?.naturalHeight || gifNatDims.h
                      const scaleX = Math.max(1e-6, natW / Math.max(1, renderW))
                      const scaleY = Math.max(1e-6, natH / Math.max(1, renderH))
                      let x = Math.floor(gifPixelCrop.x * scaleX)
                      let y = Math.floor(gifPixelCrop.y * scaleY)
                      let w = Math.floor(gifPixelCrop.width * scaleX)
                      let h = Math.floor(gifPixelCrop.height * scaleY)
                      x = Math.max(0, Math.min(natW - 2, x))
                      y = Math.max(0, Math.min(natH - 2, y))
                      w = Math.max(2, Math.min(natW - x, w))
                      h = Math.max(2, Math.min(natH - y, h))
                      if (w % 2) w -= 1
                      if (h % 2) h -= 1
                      await uploadGifAvatarWithCrop(cropAvatarFile, { x, y, w, h })
                      setCropping(null); setCropAvatarFile(null);
                    } catch { }
                  }}>
                    <CropIcon className="size-4" />
                    Crop
                  </ImageCropApply>
                )}
              </div>
            </ImageCrop>
          )}
          {(cropping === 'cover' || cropping === 'cover-gif') && cropCoverFile && (
            <ImageCrop
              aspect={3 / 1}
              file={cropCoverFile}
              maxImageSize={1024 * 1024 * 2}
              onComplete={(px) => { try { setGifPixelCrop(px) } catch { } }}
              onCrop={async (dataUrl) => {
                if (cropping === 'cover') {
                  await uploadCoverFromCropped(dataUrl)
                }
              }}
            >
              <ImageCropContent className="max-w-full" />
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="mt-3 flex items-center gap-2 w-full">
                  <Button variant="ghost" onClick={() => { setCropping(null); setCropCoverFile(null); }}>Cancel</Button>
                </div>
                <ImageCropReset>
                  <RotateCcwIcon className="size-4" />
                  Restart
                </ImageCropReset>
                {cropping === 'cover' ? (
                  <ImageCropApply>
                    <CropIcon className="size-4" />
                    Crop
                  </ImageCropApply>
                ) : (
                  <ImageCropApply onClick={async () => {
                    try {
                      if (!gifPixelCrop || !gifNatDims || !cropCoverFile) return
                      const el = document.querySelector('img[alt="crop"]') as HTMLImageElement | null
                      const renderW = el?.width || gifNatDims.w
                      const renderH = el?.height || gifNatDims.h
                      const natW = el?.naturalWidth || gifNatDims.w
                      const natH = el?.naturalHeight || gifNatDims.h
                      const scaleX = Math.max(1e-6, natW / Math.max(1, renderW))
                      const scaleY = Math.max(1e-6, natH / Math.max(1, renderH))
                      let x = Math.floor(gifPixelCrop.x * scaleX)
                      let y = Math.floor(gifPixelCrop.y * scaleY)
                      let w = Math.floor(gifPixelCrop.width * scaleX)
                      let h = Math.floor(gifPixelCrop.height * scaleY)
                      x = Math.max(0, Math.min(natW - 2, x))
                      y = Math.max(0, Math.min(natH - 2, y))
                      w = Math.max(2, Math.min(natW - x, w))
                      h = Math.max(2, Math.min(natH - y, h))
                      if (w % 2) w -= 1
                      if (h % 2) h -= 1
                      await uploadGifCoverWithCrop(cropCoverFile, { x, y, w, h })
                      setCropping(null); setCropCoverFile(null);
                    } catch { }
                  }}>
                    <CropIcon className="size-4" />
                    Crop
                  </ImageCropApply>
                )}
              </div>
            </ImageCrop>
          )}
        </DialogContent>
      </Dialog>

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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">We will send a verification if changed.</p>
              <Button
                size="sm"
                variant="secondary"
                disabled={!formData.email || formData.email.trim() === (user?.email || '')}
                onClick={async () => {
                  const next = (formData.email || '').trim();
                  if (!next) { toast.error('Email is required'); return; }
                  // very light email check (HTML type=email already helps)
                  const ok = /.+@.+\..+/.test(next);
                  if (!ok) { toast.error('Invalid email'); return; }
                  if (user?.email && next === user.email) { toast.message('Email unchanged'); return; }
                  const p = supabase.auth.updateUser({ email: next });
                  toast.promise(p, {
                    loading: 'Updating email…',
                    success: () => 'Verification sent to new email',
                    error: (err) => (err instanceof Error ? err.message : 'Failed to update email'),
                  });
                  try {
                    const { error } = await p;
                    if (error) return;
                    try { await supabase.auth.refreshSession() } catch { }
                  } catch { }
                }}
              >
                Update Email
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="Enter current password" value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Enter new password" value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" placeholder="Re-enter new password" value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)} />
          </div>
          <div>
            <Button
              size="sm"
              disabled={pwdLoading}
              onClick={async () => {
                if (!user?.email) { toast.error("Missing user email"); return }
                // basic validations
                if (!pwdCurrent) { toast.error("Enter current password"); return }
                if (pwdNew.length < 8) { toast.error("New password must be at least 8 characters"); return }
                if (pwdNew !== pwdConfirm) { toast.error("Passwords do not match"); return }
                if (pwdNew === pwdCurrent) { toast.error("New password cannot be the same as current"); return }

                setPwdLoading(true)
                try {
                  // Temporarily suppress unsaved-changes state
                  try { resetChanges?.() } catch { }
                  // verify current password
                  const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pwdCurrent })
                  if (verifyErr) { toast.error("Current password is incorrect"); return }

                  // update to new password
                  const { error: updErr } = await supabase.auth.updateUser({ password: pwdNew })
                  if (updErr) { toast.error(updErr.message); return }

                  try { await supabase.auth.refreshSession() } catch { }
                  setPwdCurrent("")
                  setPwdNew("")
                  setPwdConfirm("")
                  toast.success("Password updated")
                } finally {
                  setPwdLoading(false)
                  // Recompute unsaved status for profile fields only
                  try {
                    checkForChanges?.({
                      displayName: formData.displayName,
                      username: formData.username,
                      bio: formData.bio || ''
                    })
                  } catch { }
                }
              }}
            >
              {pwdLoading ? "Updating…" : "Change Password"}
            </Button>
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
