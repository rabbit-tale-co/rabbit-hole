"use client"

import * as React from "react"
import {
  Bell,
  Paintbrush,
  Settings,
  User,
  Shield,
  Camera,
  X,
} from "lucide-react"

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

import { Profile, Privacy, Appearance, Notifications, Content } from "./index"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Context for managing unsaved changes across settings components
export const UnsavedChangesContext = React.createContext<{
  markAsChanged: () => void;
  markAsSaved: () => void;
  resetChanges: () => void;
  checkForChanges: (currentValues: {
    displayName: string;
    username: string;
    bio: string;
  }) => void;
  registerSaveFunction: (saveFn: () => Promise<void>) => void;
}>({
  markAsChanged: () => { },
  markAsSaved: () => { },
  resetChanges: () => { },
  checkForChanges: () => { },
  registerSaveFunction: () => { },
})

export const useUnsavedChanges = () => React.useContext(UnsavedChangesContext)

type SettingsSection = "profile" | "privacy" | "appearance" | "notifications" | "content";
type NavItem = { name: string; icon: React.ElementType; id: SettingsSection };

const data: { nav: NavItem[] } = {
  nav: [
    { name: "Profile & Settings", icon: User, id: "profile" },
    { name: "Privacy", icon: Shield, id: "privacy" },
    { name: "Appearance", icon: Paintbrush, id: "appearance" },
    { name: "Notifications", icon: Bell, id: "notifications" },
    { name: "Content", icon: Camera, id: "content" },
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
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
  const { user: auth_user, profile } = useAuth()

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  // Track original values for comparison
  const [originalValues, setOriginalValues] = React.useState({
    displayName: '',
    username: '',
    bio: ''
  })

  // Track save function from active component
  const [activeSaveFunction, setActiveSaveFunction] = React.useState<(() => Promise<void>) | null>(null)

  // Update original values when user changes or dialog opens
  React.useEffect(() => {
    if (profile && open) {
      setOriginalValues({
        displayName: profile.display_name,
        username: profile.username,
        bio: ''
      })
    }
  }, [profile, open])

  // Simple functions to manage unsaved changes
  const markAsChanged = React.useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  const markAsSaved = React.useCallback(() => {
    setHasUnsavedChanges(false)
    // Update original values to current values
    setOriginalValues({
      displayName: profile?.display_name ?? '',
      username: profile?.username ?? 'username',
      bio: ''
    })
  }, [profile])

  const resetChanges = React.useCallback(() => {
    setHasUnsavedChanges(false)
  }, [])

  // Function to register save function from active component
  const registerSaveFunction = React.useCallback((saveFn: () => Promise<void>) => {
    setActiveSaveFunction(() => saveFn)
  }, [])

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

  // Function to check if there are actual changes
  const checkForChanges = React.useCallback((currentValues: {
    displayName: string;
    username: string;
    bio: string;
  }) => {
    const hasChanges =
      currentValues.displayName !== originalValues.displayName ||
      currentValues.username !== originalValues.username ||
      currentValues.bio !== originalValues.bio

    setHasUnsavedChanges(hasChanges)
  }, [originalValues])

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
  const handleSectionChange = (section: "profile" | "privacy" | "appearance" | "notifications" | "content") => {
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent
          className={cn("overflow-hidden rounded-2xl p-0 md:max-h-[600px] md:max-w-4xl", {
            "md:max-w-xl": singleSectionOnly,
          })}
          onPointerDownOutside={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault()
              if (typeof window !== 'undefined' && (window as Window & { triggerToastShake?: () => void }).triggerToastShake) {
                (window as Window & { triggerToastShake?: () => void }).triggerToastShake!()
              }
            }
          }}
          onEscapeKeyDown={(e) => {
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
            markAsChanged,
            markAsSaved,
            resetChanges,
            checkForChanges,
            registerSaveFunction,
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
                        <X className="size-4" />
                      </Button>
                    </DialogClose>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pt-4">
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
    </>
  )
}
