"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import {
  OutlineBell,
  OutlineBrush,
  OutlineClose,
  OutlineImage,
  OutlineReceipt,
  OutlineSettings,
  OutlineShield,
  OutlineUser,
  OutlineWarning,
} from "../icons/Icons";
import {
  Appearance,
  Billing,
  Content,
  Notifications,
  Privacy,
  Profile,
} from "./index";

// Unsaved changes provider API
type SaveFn = (() => void | Promise<void>) | null;
type ResetFn = (() => void) | null;
type Ctx = {
  isDirty: boolean;
  markAsSaved: () => void;
  resetChanges: () => void;
  checkForChanges: (snapshot: unknown) => void;
  registerSaveFunction: (fn: SaveFn) => void;
  registerResetFunction: (fn: ResetFn) => void;
  runSave: () => Promise<void>;
};

const UnsavedChangesContext = React.createContext<Ctx | null>(null);

export function useUnsavedChanges() {
  const ctx = React.useContext(UnsavedChangesContext);
  if (!ctx) {
    return {
      isDirty: false,
      markAsSaved: () => { },
      resetChanges: () => { },
      checkForChanges: () => { },
      registerSaveFunction: () => { },
      registerResetFunction: () => { },
      runSave: async () => { },
    };
  }
  return ctx;
}

// Settings content component
function SettingsContent({
  activeSection,
  user,
}: {
  activeSection: string;
  user: any;
}) {
  switch (activeSection) {
    case "profile":
      return <Profile user={user} />;
    case "privacy":
      return <Privacy />;
    case "appearance":
      return <Appearance />;
    case "notifications":
      return <Notifications />;
    case "content":
      return <Content />;
    case "billing":
      return <Billing />;
    default:
      return <Profile user={user} />;
  }
}

// Navigation items
const navItems = [
  { id: "profile", name: "Profile", icon: OutlineUser },
  { id: "privacy", name: "Privacy", icon: OutlineShield },
  { id: "appearance", name: "Appearance", icon: OutlineBrush },
  { id: "notifications", name: "Notifications", icon: OutlineBell },
  { id: "content", name: "Content", icon: OutlineImage },
  { id: "billing", name: "Billing", icon: OutlineReceipt },
];

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  singleSectionOnly?: boolean;
  initialSection?: string;
}

export function SettingsDialog({
  open: controlledOpen,
  onOpenChange,
  singleSectionOnly = false,
  initialSection = "profile",
}: SettingsDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState(initialSection);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [activeSaveFunction, setActiveSaveFunction] = React.useState<SaveFn>(null);
  const [activeResetFunction, setActiveResetFunction] = React.useState<ResetFn>(null);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = React.useState(false);
  const [unsavedData, setUnsavedData] = React.useState<{
    reason: string;
    onConfirm: () => void;
  } | null>(null);
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = React.useState(false);
  const [canceling, setCanceling] = React.useState(false);

  const { user: auth_user, profile } = useAuth();

  const setOpen = onOpenChange ?? setInternalOpen;
  const open = controlledOpen ?? internalOpen;

  // Refs and helper for confirm dialog
  const reopenAfterConfirmRef = React.useRef(false);

  const closeConfirmAndMaybeReopen = React.useCallback(() => {
    setShowUnsavedDialog(false);
    setUnsavedData(null);
    if (reopenAfterConfirmRef.current) {
      reopenAfterConfirmRef.current = false;
      setTimeout(() => setOpen(true), 60);
    }
  }, [setOpen]);

  // Canonicalization and baseline tracking for unsaved changes
  const baselineKeyRef = React.useRef<string>("");
  const currentKeyRef = React.useRef<string>("");
  const canonDeep = React.useCallback((v: unknown): unknown => {
    if (v === null || v === undefined) return v;
    if (typeof v === "string") return v.normalize("NFC").replace(/\r\n/g, "\n").trim();
    if (typeof v === "number" || typeof v === "boolean") return v;
    if (Array.isArray(v)) return v.map(canonDeep);
    if (typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(obj)) {
        result[k] = canonDeep(val);
      }
      return result;
    }
    return v;
  }, []);

  const markAsSaved = React.useCallback(() => {
    setHasUnsavedChanges(false);
    baselineKeyRef.current = currentKeyRef.current;
  }, []);

  const resetChanges = React.useCallback(() => {
    setHasUnsavedChanges(false);
    currentKeyRef.current = baselineKeyRef.current;
  }, []);

  const checkForChanges = React.useCallback(
    (snapshot: unknown) => {
      const canonSnapshot = canonDeep(snapshot);
      const key = JSON.stringify(canonSnapshot);
      currentKeyRef.current = key;
      const isDirty = key !== baselineKeyRef.current;
      console.log("checkForChanges called:", {
        snapshot,
        canonSnapshot,
        key,
        baselineKey: baselineKeyRef.current,
        isDirty
      });
      setHasUnsavedChanges(isDirty);
    },
    [canonDeep],
  );

  const handleSaveFromToast = React.useCallback(async () => {
    if (activeSaveFunction) {
      await activeSaveFunction();
    }
  }, [activeSaveFunction]);

  const handleResetFromToast = React.useCallback(() => {
    console.log("handleResetFromToast called", { activeResetFunction });
    if (activeResetFunction) {
      activeResetFunction();
    }
    setHasUnsavedChanges(false);
  }, [activeResetFunction]);

  const registerResetFunction = React.useCallback((fn: ResetFn) => {
    console.log("registerResetFunction called", { fn });
    setActiveResetFunction(() => fn);
  }, []);

  const handleSectionChange = React.useCallback(
    (sectionId: string) => {
      if (hasUnsavedChanges) {
        if (isDesktop) {
          // Desktop: show modal dialog
          setUnsavedData({
            reason: "You have unsaved changes. Are you sure you want to switch sections?",
            onConfirm: () => {
              setActiveSection(sectionId);
              resetChanges();
            },
          });
          setShowUnsavedDialog(true);
          reopenAfterConfirmRef.current = true;
          setOpen(false);
        } else {
          // Mobile: just shake toast and don't change section
          if (
            typeof window !== "undefined" &&
            (window as Window & { triggerToastShake?: () => void })
              .triggerToastShake
          ) {
            (window as Window & { triggerToastShake?: () => void })
              .triggerToastShake!();
          }
        }
      } else {
        setActiveSection(sectionId);
      }
    },
    [hasUnsavedChanges, resetChanges, setOpen],
  );

  const handleDialogClose = React.useCallback(
    (open: boolean) => {
      if (!open && hasUnsavedChanges) {
        setUnsavedData({
          reason: "You have unsaved changes. Are you sure you want to close?",
          onConfirm: () => {
            setOpen(false);
            resetChanges();
          },
        });
        setShowUnsavedDialog(true);
        reopenAfterConfirmRef.current = true;
      } else {
        setOpen(open);
      }
    },
    [hasUnsavedChanges, resetChanges, setOpen],
  );

  // For mobile drawer - don't show modal dialog, just prevent closing
  const handleDrawerClose = React.useCallback(
    (open: boolean) => {
      if (!open && hasUnsavedChanges) {
        // Don't close the drawer, just prevent it and shake toast
        if (
          typeof window !== "undefined" &&
          (window as Window & { triggerToastShake?: () => void })
            .triggerToastShake
        ) {
          (window as Window & { triggerToastShake?: () => void })
            .triggerToastShake!();
        }
        return;
      } else {
        setOpen(open);
      }
    },
    [hasUnsavedChanges, setOpen],
  );

  const cancelSubscription = React.useCallback(async () => {
    setCanceling(true);
    try {
      // Add your subscription cancellation logic here
      console.log("Canceling subscription...");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
    } finally {
      setCanceling(false);
    }
  }, []);

  // Determine if we should show desktop or mobile version

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Listen for cancel subscription dialog trigger
  React.useEffect(() => {
    const handleShowCancelDialog = () => {
      setShowCancelSubscriptionDialog(true);
    };

    window.addEventListener("settings:showCancelDialog", handleShowCancelDialog);
    return () => {
      window.removeEventListener("settings:showCancelDialog", handleShowCancelDialog);
    };
  }, []);

  return (
    <>
      {/* Desktop Dialog - only on lg+ screens */}
      {isDesktop && (
        <Dialog
          open={open && !showUnsavedDialog && !showCancelSubscriptionDialog}
          onOpenChange={handleDialogClose}
        >
          <DialogContent
            className={cn(
              "overflow-hidden rounded-2xl p-0 md:max-h-[600px] md:max-w-4xl",
              {
                "md:max-w-xl": singleSectionOnly,
              },
            )}
            onPointerDownOutside={(e) => {
              if (showUnsavedDialog || showCancelSubscriptionDialog) return;
              if (hasUnsavedChanges) {
                e.preventDefault();
                if (
                  typeof window !== "undefined" &&
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake
                ) {
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake!();
                }
              }
            }}
            onEscapeKeyDown={(e) => {
              if (showUnsavedDialog || showCancelSubscriptionDialog) return; // nie przechwytuj Esc
              if (hasUnsavedChanges) {
                e.preventDefault();
                if (
                  typeof window !== "undefined" &&
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake
                ) {
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake!();
                }
              }
            }}
            toast={{
              message: "Careful — you have unsaved changes!",
              onSave: handleSaveFromToast,
              onReset: handleResetFromToast,
              show: hasUnsavedChanges,
            }}
          >
            <DialogTitle className="sr-only">User Settings</DialogTitle>

            <UnsavedChangesContext.Provider
              value={{
                isDirty: hasUnsavedChanges,
                markAsSaved,
                resetChanges,
                checkForChanges,
                registerSaveFunction: (fn) =>
                  setActiveSaveFunction(
                    () => fn as unknown as () => Promise<void>,
                  ),
                registerResetFunction,
                runSave: handleSaveFromToast,
              }}
            >
              <SidebarProvider className="items-start">
                {!singleSectionOnly && (
                  <Sidebar collapsible="none" className="hidden md:flex">
                    <SidebarContent>
                      {/* Sidebar items moved below with spacing */}
                      <SidebarGroup>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            {navItems.map((item) => (
                              <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={activeSection === item.id}
                                  onClick={() => handleSectionChange(item.id)}
                                >
                                  <Button
                                    className="w-full justify-start"
                                    variant={"ghost"}
                                  >
                                    <item.icon className="size-4" />
                                    <span className="ml-2">{item.name}</span>
                                  </Button>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>
                  </Sidebar>
                )}
                <main className="flex h-[600px] flex-1 flex-col overflow-hidden">
                  <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                    <div className="flex items-center gap-2">
                      {!singleSectionOnly && (
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                              <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                              <BreadcrumbPage>
                                {navItems.find(
                                  (item) => item.id === activeSection,
                                )?.name || "Settings"}
                              </BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <DialogClose asChild>
                        <Button variant="ghost" size="icon">
                          <OutlineClose />
                        </Button>
                      </DialogClose>
                    </div>
                  </header>
                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                    <SettingsContent
                      activeSection={activeSection}
                      user={
                        profile
                          ? {
                            id: profile.user_id,
                            email: auth_user?.email ?? "",
                            user_metadata: {
                              displayName: profile.display_name,
                              username: profile.username,
                              bio: "",
                              avatar_url: profile.avatar_url ?? undefined,
                              coverImage: profile.cover_url ?? undefined,
                              accentColor: profile.accent_color ?? undefined,
                            },
                          }
                          : null
                      }
                    />
                  </div>
                </main>
              </SidebarProvider>
            </UnsavedChangesContext.Provider>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile/Tablet Drawer - only below lg screens */}
      {!isDesktop && (
        <Drawer
          open={open && !showCancelSubscriptionDialog}
          onOpenChange={handleDrawerClose}
        >
          <DrawerContent
            className="!max-h-[95vh] !h-[95vh]"
            onPointerDownOutside={(e) => {
              if (hasUnsavedChanges) {
                e.preventDefault();
                if (
                  typeof window !== "undefined" &&
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake
                ) {
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake!();
                }
              }
            }}
            onEscapeKeyDown={(e) => {
              if (hasUnsavedChanges) {
                e.preventDefault();
                if (
                  typeof window !== "undefined" &&
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake
                ) {
                  (window as Window & { triggerToastShake?: () => void })
                    .triggerToastShake!();
                }
              }
            }}
            toast={{
              message: "Careful — you have unsaved changes!",
              onSave: handleSaveFromToast,
              onReset: handleResetFromToast,
              show: hasUnsavedChanges,
            }}
          >
            <DrawerHeader className="text-center">
              <DrawerTitle>Settings</DrawerTitle>
            </DrawerHeader>

            <UnsavedChangesContext.Provider
              value={{
                isDirty: hasUnsavedChanges,
                markAsSaved,
                resetChanges,
                checkForChanges,
                registerSaveFunction: (fn) =>
                  setActiveSaveFunction(
                    () => fn as unknown as () => Promise<void>,
                  ),
                registerResetFunction,
                runSave: handleSaveFromToast,
              }}
            >
              <div className="flex flex-col min-h-0">
                {/* Mobile Navigation */}
                {!singleSectionOnly && (
                  <div className="flex-shrink-0 border-b px-4 py-2">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                      {navItems.map((item) => (
                        <Button
                          key={item.name}
                          variant={
                            activeSection === item.id ? "default" : "ghost"
                          }
                          size="sm"
                          className={cn(
                            "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                            activeSection === item.id
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "hover:bg-muted hover:text-foreground",
                          )}
                          onClick={() => handleSectionChange(item.id)}
                        >
                          <item.icon className="size-4 mr-2" />
                          {item.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                  <SettingsContent
                    activeSection={activeSection}
                    user={
                      profile
                        ? {
                          id: profile.user_id,
                          email: auth_user?.email ?? "",
                          user_metadata: {
                            displayName: profile.display_name,
                            username: profile.username,
                            bio: "",
                            avatar_url: profile.avatar_url ?? undefined,
                            coverImage: profile.cover_url ?? undefined,
                            accentColor: profile.accent_color ?? undefined,
                          },
                        }
                        : null
                    }
                  />
                </div>
              </div>
            </UnsavedChangesContext.Provider>
          </DrawerContent>
        </Drawer>
      )}

      {/* Unsaved Changes Dialog - Teleported to root */}
      {showUnsavedDialog &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeConfirmAndMaybeReopen();
            }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <div
              className="w-full max-w-md mx-4 rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                  <OutlineWarning className="h-5 w-5" />
                  Unsaved Changes
                </div>
                <button
                  onClick={closeConfirmAndMaybeReopen}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <OutlineClose className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {unsavedData?.reason || "You have unsaved changes."}
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={closeConfirmAndMaybeReopen}
                    disabled={canceling}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      unsavedData?.onConfirm();
                      closeConfirmAndMaybeReopen();
                    }}
                    disabled={canceling}
                    size="sm"
                  >
                    Discard Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Cancel Subscription Dialog - Teleported to root */}
      {showCancelSubscriptionDialog &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCancelSubscriptionDialog(false);
              }
            }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
            }}
          >
            <div
              className="w-full max-w-md mx-4 rounded-xl border border-neutral-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <OutlineWarning className="h-5 w-5" />
                  Cancel Subscription
                </div>
                <button
                  onClick={() => setShowCancelSubscriptionDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <OutlineClose className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to cancel your subscription? You&apos;ll
                  lose access to premium features at the end of your current
                  billing period.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelSubscriptionDialog(false)}
                    disabled={canceling}
                    size="sm"
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await cancelSubscription();
                      // Trigger refresh of billing data
                      window.dispatchEvent(new CustomEvent("billing:refresh"));
                      setShowCancelSubscriptionDialog(false);
                    }}
                    disabled={canceling}
                    size="sm"
                  >
                    {canceling ? "Canceling…" : "Cancel Subscription"}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
