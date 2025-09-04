"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Profile, Privacy, Appearance, Notifications, Content, Billing } from "./index"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OutlineBell, OutlineBrush, OutlineClose, OutlineImage, OutlineReceipt, OutlineSettings, OutlineShield, OutlineUser, OutlineWarning } from "../icons/Icons"
import { toast } from "sonner"

// Unsaved changes provider API
type SaveFn = (() => void | Promise<void>) | null;
type Ctx = {
  isDirty: boolean;
  checkForChanges: (values: unknown) => void;
  markAsSaved: () => void;
  resetChanges: () => void;
  registerSaveFunction: (fn: NonNullable<SaveFn>) => void;
  runSave: () => Promise<void>;
};
export const UnsavedChangesContext = React.createContext<Ctx | null>(null)
export const useUnsavedChanges = () => {
  const ctx = React.useContext(UnsavedChangesContext)
  if (!ctx) throw new Error("useUnsavedChanges must be used inside SettingsDialog")
  return ctx
}

type SettingsSection = "profile" | "privacy" | "appearance" | "notifications" | "content" | "billing";
type NavItem = { name: string; icon: React.ElementType; id: SettingsSection };

const data: { nav: NavItem[] } = {
  nav: [
    { name: "Profile & Settings", icon: OutlineUser, id: "profile" },
    { name: "Privacy", icon: OutlineShield, id: "privacy" },
    { name: "Appearance", icon: OutlineBrush, id: "appearance" },
    { name: "Notifications", icon: OutlineBell, id: "notifications" },
    { name: "Content", icon: OutlineImage, id: "content" },
    { name: "Billing & Subscription", icon: OutlineReceipt, id: "billing" },
  ],
}

interface SettingsContentProps {
  activeSection: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      displayName?: string;
      username?: string;
      bio?: string;
      avatar_url?: string;
      coverImage?: string;
      handler?: string;
      accentColor?: string;
    };
  } | null;
}

function SettingsContent({ activeSection, user }: SettingsContentProps) {
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
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <OutlineSettings className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Select a setting</h3>
            <p className="text-sm text-gray-500">Choose a category from the sidebar to get started</p>
          </div>
        </div>
      );
  }
}

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialSection?: SettingsSection;
  sections?: Array<SettingsSection>;
}

export function SettingsDialog({ open: controlledOpen, onOpenChange, initialSection = "profile", sections }: SettingsDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState(initialSection)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [canceling, setCanceling] = React.useState(false)
  const [cancelData, setCancelData] = React.useState<{ subscriptionId: string; userId: string } | null>(null)
  const { user: auth_user, profile } = useAuth()

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  // Refs and helper for confirm dialog
  const reopenAfterConfirmRef = React.useRef(false);

  const closeConfirmAndMaybeReopen = React.useCallback(() => {
    setShowCancelDialog(false);
    setCancelData(null);
    if (reopenAfterConfirmRef.current) {
      reopenAfterConfirmRef.current = false;
      // mały timeout, aby Radix zdjął atrybuty aria/inert
      setTimeout(() => setOpen(true), 60);
    }
  }, [setOpen]);

  // Canonicalization and baseline tracking for unsaved changes
  const baselineKeyRef = React.useRef<string>("")
  const currentKeyRef = React.useRef<string>("")
  const canonDeep = React.useCallback((v: unknown): unknown => {
    const canonValue = (x: unknown): unknown => typeof x === "string" ? x.normalize("NFC").replace(/\r\n/g, "\n").trim() : x
    if (Array.isArray(v)) return v.map(canonDeep)
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>
      const out: Record<string, unknown> = {}
      for (const k of Object.keys(o).sort()) out[k] = canonDeep(o[k])
      return out
    }
    return canonValue(v)
  }, [])

  // Track save function from active component
  const [activeSaveFunction, setActiveSaveFunction] = React.useState<(() => Promise<void>) | null>(null)

  // Unsaved changes API implemented with canonical keys
  const checkForChanges = React.useCallback((values: unknown) => {
    currentKeyRef.current = JSON.stringify(canonDeep(values))
    setHasUnsavedChanges(currentKeyRef.current !== baselineKeyRef.current)
  }, [canonDeep])

  const markAsSaved = React.useCallback(() => {
    baselineKeyRef.current = currentKeyRef.current
    setHasUnsavedChanges(false)
  }, [])

  const resetChanges = React.useCallback(() => {
    baselineKeyRef.current = currentKeyRef.current
    setHasUnsavedChanges(false)
  }, [])

  // Update baseline when profile changes or dialog opens
  React.useEffect(() => {
    if (profile && open) {
      resetChanges()
    }
  }, [profile, open, resetChanges])

  // Reset unsaved changes when dialog closes
  React.useEffect(() => {
    if (!open) {
      resetChanges()
      setActiveSaveFunction(null)
    }
  }, [open, resetChanges])

  // Close on child request
  React.useEffect(() => {
    const onRequestClose = () => setOpen(false)
    window.addEventListener('settings:requestClose', onRequestClose)
    return () => window.removeEventListener('settings:requestClose', onRequestClose)
  }, [setOpen])

  // Listen for cancel dialog request
  React.useEffect(() => {
    const onShowCancelDialog = (event: CustomEvent) => {
      setCancelData(event.detail);
      // wymuś zamknięcie settings (bez blokady unsaved)
      reopenAfterConfirmRef.current = open; // zapamiętaj, czy mamy wrócić
      setHasUnsavedChanges(false);
      setOpen(false);
      setShowCancelDialog(true);
    };
    window.addEventListener('settings:showCancelDialog', onShowCancelDialog as EventListener);
    return () => window.removeEventListener('settings:showCancelDialog', onShowCancelDialog as EventListener);
  }, [open, setOpen])

  // Handle save from toast
  const handleSaveFromToast = React.useCallback(async () => {
    if (activeSaveFunction) {
      try {
        await activeSaveFunction()
        // Success will be handled by the component's own save logic
      } catch (error) {
        console.error('Failed to save from toast:', error)
        // Error will be handled by the component's own save logic
      }
    } else {
      console.warn('No save function registered for current section')
    }
  }, [activeSaveFunction])

  // Block navigation when there are unsaved changes
  const handleSectionChange = (section: "profile" | "privacy" | "appearance" | "notifications" | "content" | "billing") => {
    if (hasUnsavedChanges) {
      // Trigger shake effect on existing unsaved changes toast
      if (typeof window !== 'undefined' && (window as Window & { triggerToastShake?: () => void }).triggerToastShake) {
        (window as Window & { triggerToastShake?: () => void }).triggerToastShake!()
      }
      return;
    }
    setActiveSection(section);
  };

  // Block dialog close when there are unsaved changes
  const handleDialogClose = (newOpen: boolean) => {
    if (showCancelDialog) {                  // nie blokuj podczas confirm
      setOpen(newOpen);
      return;
    }
    if (hasUnsavedChanges && !newOpen) {
      // Trigger shake effect on existing unsaved changes toast
      if (typeof window !== 'undefined' && (window as Window & { triggerToastShake?: () => void }).triggerToastShake) {
        (window as Window & { triggerToastShake?: () => void }).triggerToastShake!()
      }
      return;
    }
    setOpen(newOpen);
  };

  const navItems = React.useMemo<NavItem[]>(() => {
    if (!sections || sections.length === 0) return data.nav;
    const allow = new Set<SettingsSection>(sections);
    return data.nav.filter((n) => allow.has(n.id));
  }, [sections]);

  const singleSectionOnly = navItems.length === 1;

  // Cancel subscription functionality
  const cancelSubscription = React.useCallback(async () => {
    if (!cancelData?.subscriptionId || !cancelData?.userId) {
      toast.error('No subscription to cancel');
      return;
    }

    console.log('Canceling subscription:', cancelData);
    setCanceling(true);
    try {
      const res = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: cancelData.subscriptionId,
          userId: cancelData.userId
        }),
      });

      console.log('Cancel subscription response status:', res.status);
      const data = await res.json();
      console.log('Cancel subscription response data:', data);

      if (res.ok) {
        toast.success('Subscription canceled successfully');
      } else {
        toast.error(data.error || 'Failed to cancel subscription');
      }
    } catch (e) {
      console.error('Cancel subscription error:', e);
      toast.error('Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  }, [cancelData]);

  return (
    <>
      <Dialog open={open && !showCancelDialog} onOpenChange={handleDialogClose}>
        <DialogContent
          className={cn("overflow-hidden rounded-2xl p-0 md:max-h-[600px] md:max-w-4xl", {
            "md:max-w-xl": singleSectionOnly,
          })}
          onPointerDownOutside={(e) => {
            if (showCancelDialog) return;            // pozwól klikom przejść do confirm
            if (hasUnsavedChanges) {
              e.preventDefault()
              if (typeof window !== 'undefined' && (window as Window & { triggerToastShake?: () => void }).triggerToastShake) {
                (window as Window & { triggerToastShake?: () => void }).triggerToastShake!()
              }
            }
          }}
          onEscapeKeyDown={(e) => {
            if (showCancelDialog) return;            // nie przechwytuj Esc
            if (hasUnsavedChanges) {
              e.preventDefault()
              if (typeof window !== 'undefined' && (window as Window & { triggerToastShake?: () => void }).triggerToastShake) {
                (window as Window & { triggerToastShake?: () => void }).triggerToastShake!()
              }
            }
          }}
          toast={{
            message: "Careful — you have unsaved changes!",
            onSave: handleSaveFromToast,
            onReset: () => {
              // This will be handled by individual components
              console.log('Reset triggered from dialog level')
              setHasUnsavedChanges(false)
            },
            show: hasUnsavedChanges
          }}
        >
          <DialogTitle className="sr-only">User Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Customize your user settings here.
          </DialogDescription>

          <UnsavedChangesContext.Provider value={{
            isDirty: hasUnsavedChanges,
            markAsSaved,
            resetChanges,
            checkForChanges,
            registerSaveFunction: (fn) => setActiveSaveFunction(() => fn as unknown as () => Promise<void>),
            runSave: handleSaveFromToast,
          }}>
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
                                <Button className="w-full justify-start" variant={"ghost"}>
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
                              {navItems.find(item => item.id === activeSection)?.name || "Settings"}
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
                    user={profile ? {
                      id: profile.user_id,
                      email: auth_user?.email ?? '',
                      user_metadata: {
                        displayName: profile.display_name,
                        username: profile.username,
                        bio: '',
                        avatar_url: profile.avatar_url ?? undefined,
                        coverImage: profile.cover_url ?? undefined,
                        accentColor: profile.accent_color ?? undefined,
                      }
                    } : null}
                  />
                </div>
              </main>
            </SidebarProvider>
          </UnsavedChangesContext.Provider>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog - Teleported to root */}
      {showCancelDialog && typeof window !== 'undefined' && createPortal(
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
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <OutlineWarning className="h-5 w-5" />
                Cancel Subscription
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
                Are you sure you want to cancel your subscription? You&apos;ll lose access to premium features at the end of your current billing period.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeConfirmAndMaybeReopen} disabled={canceling} size="sm">
                  Keep Subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await cancelSubscription();       // po sukcesie też zamknij i wznow
                    // Trigger refresh of billing data
                    window.dispatchEvent(new CustomEvent('billing:refresh'));
                    closeConfirmAndMaybeReopen();
                  }}
                  disabled={canceling}
                  size="sm"
                >
                  {canceling ? 'Canceling…' : 'Cancel Subscription'}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
