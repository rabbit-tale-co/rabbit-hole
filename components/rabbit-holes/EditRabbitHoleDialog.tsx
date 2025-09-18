"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { generateUrlFromName, validateUrl } from "@/lib/utils/url-generator";
import { cn } from "@/lib/utils";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import {
  OutlineClose,
  OutlineMinus,
  OutlinePlus,
} from "@/components/icons/Icons";
import Image from "next/image";
import { validateImageFile } from "@/lib/utils/image-upload";
import { PresenceEditor } from "@/components/ui/PresenceEditor";
import { useMedia } from "@/hooks/useMedia";
import { DeleteRabbitHoleDialog } from "@/components/rabbit-holes/DeleteRabbitHoleDialog";
import { useRouter } from "next/navigation";

// Zod schema for validation
const editRabbitHoleSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  url: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .max(50, "URL must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "URL can only contain lowercase letters, numbers, and hyphens"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  rules: z
    .array(z.string().min(1, "Rule cannot be empty").max(100, "Rule must be less than 100 characters"))
    .max(10, "Maximum 10 rules")
    .optional(),
});

interface EditRabbitHoleDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  rabbitHole: {
    id: string;
    name: string;
    url: string;
    description?: string;
    rules?: string[];
    avatar_url?: string;
    cover_url?: string;
  };
}

export function EditRabbitHoleDialog({
  open: controlledOpen,
  onOpenChange,
  rabbitHole,
}: EditRabbitHoleDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = React.useState({
    name: "",
    url: "",
    description: "",
    rules: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Auto mode: true when both name and URL are empty, false when user edits URL
  const [auto, setAuto] = React.useState(true);

  const { updateRabbitHole } = useRabbitHoles();
  const media = useMedia();

  const setOpen = onOpenChange ?? setInternalOpen;
  const open = controlledOpen ?? internalOpen;

  // Determine if we should show desktop or mobile version
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Initialize form data when dialog opens
  React.useEffect(() => {
    if (open && rabbitHole) {
      setFormData({
        name: rabbitHole.name,
        url: rabbitHole.url,
        description: rabbitHole.description || "",
        rules: rabbitHole.rules || [],
      });
      setValidationErrors({});
      setAuto(true);
      setAvatarPreview(rabbitHole.avatar_url || null);
      setCoverPreview(rabbitHole.cover_url || null);
    }
  }, [open, rabbitHole]);

  // Auto-generate URL when in auto mode and name is provided
  React.useEffect(() => {
    if (auto && formData.name) {
      const generatedUrl = generateUrlFromName(formData.name);
      setFormData(prev => ({ ...prev, url: generatedUrl }));
    }
  }, [formData.name, auto]);

  // Set auto mode based on both fields being empty
  React.useEffect(() => {
    if (!formData.name && !formData.url) {
      setAuto(true);
    }
  }, [formData.name, formData.url]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle URL input with character restriction
  const handleUrlChange = (value: string) => {
    // Only allow a-z, 0-9, and hyphens
    const filteredValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, url: filteredValue }));

    // Disable auto mode when user edits URL
    setAuto(false);

    // Clear validation error for URL
    if (validationErrors.url) {
      setValidationErrors(prev => ({ ...prev, url: "" }));
    }
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    try {
      // Validate form data with Zod
      const validatedData = editRabbitHoleSchema.parse(formData);

      setIsSubmitting(true);

      // Update rabbit hole
      const result = await updateRabbitHole(
        rabbitHole.id,
        validatedData.name,
        validatedData.url,
        validatedData.description || undefined,
        validatedData.rules && validatedData.rules.length > 0 ? validatedData.rules : undefined
      );

      if (!result) {
        throw new Error("Failed to update rabbit hole");
      }

      // Success
      toast.success("Rabbit hole updated successfully!");
      setOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        return;
      }
      console.error("Error updating rabbit hole:", error);
      toast.error("An error occurred while updating rabbit hole");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Avatar/Cover upload helpers
  const updateImagesInDb = async (payload: { avatar_url?: string | null; cover_url?: string | null }) => {
    const res = await fetch('/api/rabbit-holes/update-images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rabbit_hole_id: rabbitHole.id, ...payload }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(t || 'Failed to update images');
    }
  };

  const onPickAvatar = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const valid = validateImageFile(file);
      if (!valid.isValid) { toast.error(valid.error || 'Invalid image'); return; }
      setUploadingAvatar(true);
      try {
        const fd = new FormData();
        fd.append('rabbitHoleId', rabbitHole.id);
        fd.append('rabbit_hole_id', rabbitHole.id);
        fd.append('file', file);
        const { imageId } = await media.uploadRabbitHoleAvatar(fd);
        if (!imageId) throw new Error('Upload failed');
        const base = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE || '';
        const url = `${String(base).replace(/\/$/, '')}/rabbit-hole/avatar/${rabbitHole.id}/avatar.webp?v=${encodeURIComponent(imageId)}`;
        setAvatarPreview(url);
        await updateImagesInDb({ avatar_url: url });
        toast.success('Avatar updated');
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : 'Failed to upload avatar');
      } finally {
        setUploadingAvatar(false);
      }
    };
    input.click();
  };

  const onPickCover = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const valid = validateImageFile(file);
      if (!valid.isValid) { toast.error(valid.error || 'Invalid image'); return; }
      setUploadingCover(true);
      try {
        const fd = new FormData();
        fd.append('rabbitHoleId', rabbitHole.id);
        fd.append('rabbit_hole_id', rabbitHole.id);
        fd.append('file', file);
        const { imageId } = await media.uploadRabbitHoleCover(fd);
        if (!imageId) throw new Error('Upload failed');
        const base = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE || '';
        const url = `${String(base).replace(/\/$/, '')}/rabbit-hole/covers/${rabbitHole.id}/cover.webp?v=${encodeURIComponent(imageId)}`;
        setCoverPreview(url);
        await updateImagesInDb({ cover_url: url });
        toast.success('Cover updated');
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : 'Failed to upload cover');
      } finally {
        setUploadingCover(false);
      }
    };
    input.click();
  };

  const removeAvatar = async () => {
    try {
      await updateImagesInDb({ avatar_url: null });
      setAvatarPreview(null);
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    }
  };

  const removeCover = async () => {
    try {
      await updateImagesInDb({ cover_url: null });
      setCoverPreview(null);
      toast.success('Cover removed');
    } catch {
      toast.error('Failed to remove cover');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setOpen(false);
  };

  // Handle rules management
  const addRule = () => {
    if (formData.rules.length < 10) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, ""]
      }));
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  return (
    <>
      {/* Desktop Dialog - only on lg+ screens */}
      {isDesktop && (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex flex-row items-start justify-between">
              <div>
                <DialogTitle>Edit Rabbit Hole</DialogTitle>
                <DialogDescription>
                  Update your rabbit hole settings and rules.
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? "Updating..." : "Update Rabbit Hole"}
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <PresenceEditor
                coverUrl={coverPreview || undefined}
                avatarUrl={avatarPreview || undefined}
                onPickCover={onPickCover}
                onPickAvatar={onPickAvatar}
                onRemoveCover={removeCover}
                onRemoveAvatar={removeAvatar}
                uploadingCover={uploadingCover}
                uploadingAvatar={uploadingAvatar}
              />
              {/* Form Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Name of your rabbit hole"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={validationErrors.name ? "border-red-500" : ""}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    placeholder="my-awesome-rabbit-hole"
                    value={formData.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={validationErrors.url ? "border-red-500" : ""}
                  />
                  {validationErrors.url && (
                    <p className="text-sm text-red-500">
                      {validationErrors.url}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {auto
                      ? formData.name
                        ? "URL auto-generates from name. Click to edit manually."
                        : "URL will auto-generate when you enter a name."
                      : "URL is manually edited. Only lowercase letters, numbers, and hyphens allowed."
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what will be in this rabbit hole..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={validationErrors.description ? "border-red-500" : ""}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-500">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rules">Rules (optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRule}
                      disabled={formData.rules.length >= 10}
                    >
                      Add Rule
                    </Button>
                  </div>

                  {formData.rules.length > 0 && (
                    <div className="space-y-2">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Rule ${index + 1}`}
                            value={rule}
                            onChange={(e) => updateRule(index, e.target.value)}
                            className={validationErrors[`rules.${index}`] ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeRule(index)}
                            className="flex-shrink-0"
                          >
                            <OutlineMinus />
                          </Button>
                        </div>
                      ))}
                      {validationErrors.rules && (
                        <p className="text-sm text-red-500">
                          {validationErrors.rules}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.rules.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Click "Add Rule" to add your first rule
                    </p>
                  )}
                </div>
              </div>

              {/* Danger Zone (desktop) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Danger Zone</h3>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800 mb-2">Delete Rabbit Hole</h4>
                  <p className="text-sm text-red-600 mb-3">
                    This action cannot be undone. All data related to this rabbit hole will be permanently deleted.
                  </p>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    Delete Rabbit Hole
                  </Button>
                </div>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile/Tablet Drawer - only below lg screens */}
      {!isDesktop && (
        <Drawer open={open} onOpenChange={handleClose}>
          <DrawerContent className="!max-h-[90vh]">
            <DrawerHeader className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
              <DrawerTitle>Edit Rabbit Hole</DrawerTitle>
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DrawerHeader>

            <div className="flex flex-col min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
                {/* Form Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-name">Name *</Label>
                    <Input
                      id="mobile-name"
                      placeholder="Name of your rabbit hole"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={validationErrors.name ? "border-red-500" : ""}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-500">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-url">URL *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (formData.name) {
                            const generatedUrl = generateUrlFromName(formData.name);
                            setFormData(prev => ({ ...prev, url: generatedUrl }));
                            setAuto(true); // Enable auto mode
                          }
                        }}
                        disabled={!formData.name}
                        className="text-xs"
                      >
                        Generate
                      </Button>
                    </div>
                    <Input
                      id="mobile-url"
                      placeholder="my-awesome-rabbit-hole"
                      value={formData.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className={validationErrors.url ? "border-red-500" : ""}
                    />
                    {validationErrors.url && (
                      <p className="text-sm text-red-500">
                        {validationErrors.url}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {auto
                        ? formData.name
                          ? "URL auto-generates from name. Click to edit manually."
                          : "URL will auto-generate when you enter a name."
                        : "URL is manually edited. Only lowercase letters, numbers, and hyphens allowed."
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile-description">Description (optional)</Label>
                    <Textarea
                      id="mobile-description"
                      placeholder="Describe what will be in this rabbit hole..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={validationErrors.description ? "border-red-500" : ""}
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-red-500">
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-rules">Rules (optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRule}
                        disabled={formData.rules.length >= 10}
                        className="flex items-center gap-2"
                      >
                        <OutlinePlus size={16} />
                        Add
                      </Button>
                    </div>

                    {formData.rules.length > 0 && (
                      <div className="space-y-2">
                        {formData.rules.map((rule, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder={`Rule ${index + 1}`}
                              value={rule}
                              onChange={(e) => updateRule(index, e.target.value)}
                              className={validationErrors[`rules.${index}`] ? "border-red-500" : ""}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeRule(index)}
                              className="flex-shrink-0"
                            >
                              <OutlineMinus size={16} />
                            </Button>
                          </div>
                        ))}
                        {validationErrors.rules && (
                          <p className="text-sm text-red-500">
                            {validationErrors.rules}
                          </p>
                        )}
                      </div>
                    )}

                    {formData.rules.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Click "Add" to add your first rule
                      </p>
                    )}
                  </div>
                </div>

                {/* Danger Zone (mobile) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Danger Zone</h3>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-medium text-red-800 mb-2">Delete Rabbit Hole</h4>
                    <p className="text-sm text-red-600 mb-3">
                      This action cannot be undone. All data related to this rabbit hole will be permanently deleted.
                    </p>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                      Delete Rabbit Hole
                    </Button>
                  </div>
                </div>

                {/* actions moved to header on mobile */}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Delete confirmation dialog (rabbit hole wording) */}
      <DeleteRabbitHoleDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        expected={rabbitHole.url}
        loading={false}
        onConfirm={async () => {
          try {
            const { supabase } = await import("@/lib/supabase");
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token;
            if (!accessToken) {
              toast.error('Authentication required');
              return;
            }
            const res = await fetch(`/api/rabbit-holes/${encodeURIComponent(rabbitHole.url)}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error(await res.text());
            toast.success('Rabbit hole deleted');
            setShowDeleteDialog(false);
            setOpen(false);
            try { router.replace('/'); router.refresh(); } catch { }
          } catch (e) {
            toast.error('Failed to delete');
          }
        }}
      />
    </>
  );
}
