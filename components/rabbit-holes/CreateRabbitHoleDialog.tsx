"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { PixelCrop } from "react-image-crop";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/ui/kibo-ui/image-crop";
import { generateUrlFromName, validateUrl } from "@/lib/utils/url-generator";
import { validateImageFile, type CropData } from "@/lib/utils/image-upload";
import { useRabbitHoleMedia } from "@/hooks/useRabbitHoleMedia";
import { cn } from "@/lib/utils";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import {
  OutlineClose,
  OutlineCrop,
  OutlineImage,
  OutlineMinus,
  OutlinePlus,
  OutlineRefreshCw,
  OutlineUser,
} from "@/components/icons/Icons";
import {
  type AccentColor,
  getAccentColorStyle,
} from "@/lib/accent-colors";

// Zod schema for validation
const createRabbitHoleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .refine((val) => val.trim().length >= 3, "Name must be at least 3 characters after trimming")
    .refine((val) => val.trim().length <= 50, "Name must be less than 50 characters after trimming"),
  url: z
    .string()
    .min(1, "URL is required")
    .min(3, "URL must be at least 3 characters")
    .max(50, "URL must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "URL can only contain lowercase letters, numbers, and hyphens")
    .refine((val) => !val.startsWith('-') && !val.endsWith('-'), "URL cannot start or end with a hyphen")
    .refine((val) => !val.includes('--'), "URL cannot contain consecutive hyphens"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  rules: z
    .array(
      z.string()
        .min(1, "Rule cannot be empty")
        .max(100, "Rule must be less than 100 characters")
        .refine((val) => val.trim().length > 0, "Rule cannot be empty or just whitespace")
    )
    .max(10, "Maximum 10 rules")
    .optional(),
});

interface CreateRabbitHoleDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateRabbitHoleDialog({
  open: controlledOpen,
  onOpenChange,
}: CreateRabbitHoleDialogProps) {
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

  // Auto mode: true when both name and URL are empty, false when user edits URL
  const [auto, setAuto] = React.useState(true);

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

  // Avatar and cover states
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  const [cropAvatarFile, setCropAvatarFile] = React.useState<File | null>(null);
  const [cropCoverFile, setCropCoverFile] = React.useState<File | null>(null);
  const [cropping, setCropping] = React.useState<
    "avatar" | "cover" | null
  >(null);
  const [avatarCropData, setAvatarCropData] = React.useState<CropData | null>(null);
  const [coverCropData, setCoverCropData] = React.useState<CropData | null>(null);

  const { createRabbitHole } = useRabbitHoles();
  const mediaRH = useRabbitHoleMedia("", "");

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

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        url: "",
        description: "",
        rules: [],
      });
      setValidationErrors({});
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarUrl(null);
      setCoverUrl(null);
      setCropAvatarFile(null);
      setCropCoverFile(null);
      setCropping(null);
      setAvatarCropData(null);
      setCoverCropData(null);
      setAuto(true);
    }
  }, [open]);

  // Get current accent color for display purposes
  const currentAccentColor = "blue" as AccentColor;

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
      const validatedData = createRabbitHoleSchema.parse(formData);

      setIsSubmitting(true);

      // Create rabbit hole
      const result = await createRabbitHole(
        validatedData.name,
        validatedData.url,
        validatedData.description || undefined,
        validatedData.rules && validatedData.rules.length > 0 ? validatedData.rules : undefined
      );

      if (!result) {
        throw new Error("Failed to create rabbit hole");
      }


      // Upload images via hook (proxy -> external API; then PATCH DB)
      if (avatarFile) {
        await mediaRH.uploadAvatarFromFile(avatarFile, { id: result.rabbitHole.id, url: result.rabbitHole.url });
      }
      if (coverFile) {
        await mediaRH.uploadCoverFromFile(coverFile, { id: result.rabbitHole.id, url: result.rabbitHole.url });
      }

      // Success
      toast.success("Rabbit hole created successfully!");
      setOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path.length === 1) {
            // Simple field error (name, url, description)
            errors[err.path[0] as string] = err.message;
          } else if (err.path.length === 2 && err.path[0] === 'rules') {
            // Rules array error
            const ruleIndex = err.path[1] as number;
            errors[`rules.${ruleIndex}`] = err.message;
          } else if (err.path[0] === 'rules') {
            // General rules error
            errors['rules'] = err.message;
          }
        });
        setValidationErrors(errors);
        return;
      }

      // Handle API errors
      if (error instanceof Error) {
        const apiError = error as any;
        console.log("🔍 API Error details:", {
          message: error.message,
          code: apiError.code,
          status: apiError.status,
          fullError: apiError
        });


        if (apiError.code === "DUPLICATE_URL") {
          setValidationErrors({ url: "A rabbit hole with this URL already exists" });
          toast.error("A rabbit hole with this URL already exists");
          return;
        }

        if (apiError.status === 409) {
          toast.error(error.message);
          return;
        }
      }

      console.error("Error creating rabbit hole:", error);
      toast.error("An error occurred while creating rabbit hole");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setOpen(false);
  };

  // Handle file selection for avatar and cover
  const handleFileSelect = (type: "avatar" | "cover") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0] || null;
      if (!file) return;

      // Create preview URL
      const url = URL.createObjectURL(file);

      if (type === "avatar") {
        setAvatarFile(file);
        setAvatarUrl(url);
        setCropAvatarFile(file);
        setCropping("avatar");
      } else {
        setCoverFile(file);
        setCoverUrl(url);
        setCropCoverFile(file);
        setCropping("cover");
      }
    };
    input.click();
  };

  // Handle crop completion - just prepare data, don't upload yet
  const handleCropComplete = async (blob: Blob, type: "avatar" | "cover", cropData?: CropData) => {
    const url = URL.createObjectURL(blob);

    if (type === "avatar") {
      setAvatarUrl(url);
      setAvatarFile(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      if (cropData) setAvatarCropData(cropData);
    } else {
      setCoverUrl(url);
      setCoverFile(new File([blob], "cover.jpg", { type: "image/jpeg" }));
      if (cropData) setCoverCropData(cropData);
    }

    setCropping(null);
    setCropAvatarFile(null);
    setCropCoverFile(null);
  };

  // Remove avatar or cover
  const removeImage = (type: "avatar" | "cover") => {
    if (type === "avatar") {
      setAvatarFile(null);
      setAvatarUrl(null);
    } else {
      setCoverFile(null);
      setCoverUrl(null);
    }
  };

  // (uploadImages) przeniesione do hooka useRabbitHoleMedia

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

    // Clear validation error for this rule when user starts typing
    const ruleKey = `rules.${index}`;
    if (validationErrors[ruleKey]) {
      setValidationErrors(prev => ({ ...prev, [ruleKey]: "" }));
    }
  };

  return (
    <>
      {/* Desktop Dialog - only on lg+ screens */}
      {isDesktop && (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex flex-row items-start justify-between">
              <div>
                <DialogTitle>Create New Rabbit Hole</DialogTitle>
                <DialogDescription>
                  Create a new, personalized feed for yourself and other users.
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
                  {isSubmitting ? "Creating..." : "Create Rabbit Hole"}
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Avatar and Cover Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Avatar and Cover</h3>

                {/* Cover Image with Avatar Overlay */}
                <div className="relative">
                  {/* Cover */}
                  <div
                    className="group/cover relative w-full h-48 rounded-2xl overflow-hidden cursor-pointer"
                    style={getAccentColorStyle(currentAccentColor, 100, "backgroundColor")}
                    onClick={() => handleFileSelect("cover")}
                  >
                    {coverUrl ? (
                      <>
                        <Image
                          src={coverUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          width={600}
                          height={192}
                        />
                        {/* Remove cover button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                aria-label="Remove cover"
                                size="icon"
                                variant="destructive"
                                className="absolute size-8 top-2 right-2 z-10 opacity-0 group-hover/cover:opacity-100 focus:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage("cover");
                                }}
                              >
                                <OutlineClose />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" align="center">
                              Remove cover
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center h-full space-y-3"
                        style={getAccentColorStyle(currentAccentColor, 950, "color")}
                      >
                        <OutlineImage size={42} />
                        <div className="text-center mb-10">
                          <p className="text-sm mb-1 font-semibold">Cover Image</p>
                          <p className="text-xs opacity-80">
                            Click to add cover image
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avatar positioned on top of cover */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <div className="relative group/avatar">
                      <div
                        className="size-28 rounded-full overflow-hidden bg-white ring-4 ring-white dark:ring-black shadow-lg cursor-pointer transition-all relative"
                        onClick={() => handleFileSelect("avatar")}
                      >
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                            width={112}
                            height={112}
                          />
                        ) : (
                          <div
                            className="w-full h-full overflow-hidden flex items-center justify-center text-2xl font-bold"
                            style={getAccentColorStyle(currentAccentColor, 200, "backgroundColor")}
                          >
                            <OutlineUser size={48} />
                            {/* hover overlay */}
                            <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
                              <div className="absolute bottom-0 left-0 w-full h-1/3 translate-y-full group-hover/avatar:translate-y-0 transition-transform duration-200 ease-out bg-neutral-950/30" />
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                                <OutlineImage size={24} className="text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Floating remove button */}
                      {avatarUrl && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                aria-label="Remove avatar"
                                size="icon"
                                variant="destructive"
                                className="absolute size-8 -bottom-1.5 -right-1.5 z-50 opacity-0 group-hover/avatar:opacity-100 focus:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeImage("avatar");
                                }}
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

                {/* Add bottom margin to accommodate avatar overflow */}
                <div className="h-12" />
              </div>

              <Separator />

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

              {/* actions moved to header */}
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
              <DrawerTitle>Create New Rabbit Hole</DrawerTitle>
              <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DrawerHeader>

            <div className="flex flex-col min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
                {/* Avatar and Cover Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Avatar and Cover</h3>

                  {/* Cover Image with Avatar Overlay */}
                  <div className="relative">
                    {/* Cover */}
                    <div
                      className="group/cover relative w-full h-40 rounded-2xl overflow-hidden cursor-pointer"
                      style={getAccentColorStyle(currentAccentColor, 100, "backgroundColor")}
                      onClick={() => handleFileSelect("cover")}
                    >
                      {coverUrl ? (
                        <>
                          <Image
                            src={coverUrl}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                            width={400}
                            height={160}
                          />
                          {/* Remove cover button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  aria-label="Remove cover"
                                  size="icon"
                                  variant="destructive"
                                  className="absolute size-8 top-2 right-2 z-10 opacity-0 group-hover/cover:opacity-100 focus:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage("cover");
                                  }}
                                >
                                  <OutlineClose />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" align="center">
                                Remove cover
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center h-full space-y-3"
                          style={getAccentColorStyle(currentAccentColor, 950, "color")}
                        >
                          <OutlineImage size={32} />
                          <div className="text-center">
                            <p className="text-sm mb-1 font-semibold">Cover Image</p>
                            <p className="text-xs opacity-80">
                              Click to add cover
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Avatar positioned on top of cover */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                      <div className="relative group/avatar">
                        <div
                          className="size-20 rounded-full overflow-hidden bg-white ring-4 ring-white dark:ring-black shadow-lg cursor-pointer transition-all relative"
                          onClick={() => handleFileSelect("avatar")}
                        >
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                              width={80}
                              height={80}
                            />
                          ) : (
                            <div
                              className="w-full h-full overflow-hidden flex items-center justify-center text-xl font-bold"
                              style={getAccentColorStyle(currentAccentColor, 200, "backgroundColor")}
                            >
                              <OutlineUser size={32} />
                              {/* hover overlay */}
                              <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
                                <div className="absolute bottom-0 left-0 w-full h-1/3 translate-y-full group-hover/avatar:translate-y-0 transition-transform duration-200 ease-out bg-neutral-950/30" />
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-full flex justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                                  <OutlineImage size={16} className="text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Floating remove button */}
                        {avatarUrl && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  aria-label="Remove avatar"
                                  size="icon"
                                  variant="destructive"
                                  className="absolute size-6 -bottom-1 -right-1 z-50 opacity-0 group-hover/avatar:opacity-100 focus:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeImage("avatar");
                                  }}
                                >
                                  <OutlineClose size={12} />
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

                  {/* Add bottom margin to accommodate avatar overflow */}
                  <div className="h-8" />
                </div>

                <Separator />

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

                {/* actions moved to header */}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Crop Modal */}
      <Dialog
        open={!!cropping}
        onOpenChange={(open) => {
          if (!open) {
            setCropping(null);
            setCropAvatarFile(null);
            setCropCoverFile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader className="flex flex-row w-full items-center justify-between">
            <DialogTitle>
              {cropping === "avatar" ? "Crop Avatar" : "Crop Cover"}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <OutlineClose />
              </Button>
            </DialogClose>
          </DialogHeader>
          {cropping === "avatar" && cropAvatarFile && (
            <ImageCrop
              aspect={1}
              circularCrop
              file={cropAvatarFile}
              maxImageSize={1024 * 1024 * 5}
              onError={(error) => {
                toast.error(error);
                setCropping(null);
                setCropAvatarFile(null);
              }}
              onCrop={async (blob) => {
                await handleCropComplete(blob, "avatar");
              }}
            >
              <ImageCropContent className="max-w-full" />
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="mt-3 flex items-center gap-2 w-full">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCropping(null);
                      setCropAvatarFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <ImageCropReset>
                  <OutlineRefreshCw />
                  Restart
                </ImageCropReset>
                <ImageCropApply>
                  <OutlineCrop />
                  Crop
                </ImageCropApply>
              </div>
            </ImageCrop>
          )}
          {cropping === "cover" && cropCoverFile && (
            <ImageCrop
              aspect={3 / 1}
              file={cropCoverFile}
              maxImageSize={1024 * 1024 * 5}
              onError={(error) => {
                toast.error(error);
                setCropping(null);
                setCropCoverFile(null);
              }}
              onCrop={async (blob) => {
                await handleCropComplete(blob, "cover");
              }}
            >
              <ImageCropContent className="max-w-full" />
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="mt-3 flex items-center gap-2 w-full">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCropping(null);
                      setCropCoverFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <ImageCropReset>
                  <OutlineRefreshCw />
                  Restart
                </ImageCropReset>
                <ImageCropApply>
                  <OutlineCrop />
                  Crop
                </ImageCropApply>
              </div>
            </ImageCrop>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
