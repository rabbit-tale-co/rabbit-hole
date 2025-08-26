"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "./button"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

// Built-in toast component for dialogs
interface DialogToastProps {
  message?: string
  onSave?: () => Promise<void>
  onReset?: () => void
  show?: boolean
}

function DialogToast({
  message = "Careful — you have unsaved changes!",
  onSave,
  onReset,
  show = false,
}: DialogToastProps) {
  const [shakeKey, setShakeKey] = React.useState(0)

  // Function to trigger shake effect
  const triggerShake = React.useCallback(() => {
    setShakeKey(prev => prev + 1)
  }, [])

  // Predefined shake patterns for variety
  const shakePatterns = [
    { x: [0, 2, -2, 2, 0], y: [0, 1, -1, 1, 0], rotate: [0, 0.5, -0.5, 0.5, 0], duration: 0.4, ease: "easeInOut" },
    { x: [0, -2, 2, -2, 0], y: [0, -1, 1, -1, 0], rotate: [0, -0.5, 0.5, -0.5, 0], duration: 0.5, ease: "easeIn" },
    { x: [0, 1, -1, 1, 0], y: [0, 2, -2, 2, 0], rotate: [0, 0.3, -0.3, 0.3, 0], duration: 0.6, ease: "easeOut" },
    { x: [0, -1, 1, -1, 0], y: [0, -2, 2, -2, 0], rotate: [0, -0.3, 0.3, -0.3, 0], duration: 0.45, ease: "easeInOut" },
    { x: [0, 3, -3, 3, 0], y: [0, 0.5, -0.5, 0.5, 0], rotate: [0, 0.7, -0.7, 0.7, 0], duration: 0.55, ease: "easeIn" },
    { x: [0, -3, 3, -3, 0], y: [0, -0.5, 0.5, -0.5, 0], rotate: [0, -0.7, 0.7, -0.7, 0], duration: 0.65, ease: "easeOut" },
    { x: [0, 1.5, -1.5, 1.5, 0], y: [0, 1.5, -1.5, 1.5, 0], rotate: [0, 0.4, -0.4, 0.4, 0], duration: 0.48, ease: "easeInOut" },
    { x: [0, -1.5, 1.5, -1.5, 0], y: [0, -1.5, 1.5, -1.5, 0], rotate: [0, -0.4, 0.4, -0.4, 0], duration: 0.52, ease: "easeIn" },
    { x: [0, 2.5, -2.5, 2.5, 0], y: [0, 0.8, -0.8, 0.8, 0], rotate: [0, 0.6, -0.6, 0.6, 0], duration: 0.58, ease: "easeOut" },
    { x: [0, -2.5, 2.5, -2.5, 0], y: [0, -0.8, 0.8, -0.8, 0], rotate: [0, -0.6, 0.6, -0.6, 0], duration: 0.42, ease: "easeInOut" }
  ]

  // Get current shake pattern based on shakeKey
  const currentShakePattern = shakePatterns[shakeKey % shakePatterns.length]

  // Expose triggerShake globally so it can be called from outside
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & { triggerToastShake?: () => void }).triggerToastShake = triggerShake
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as Window & { triggerToastShake?: () => void }).triggerToastShake
      }
    }
  }, [triggerShake])

  const content = (
    <AnimatePresence>
      {show && (
        <motion.div
          id="unsaved-toast"
          role="status"
          aria-live="polite"
          // Positioning / layering
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-70 pointer-events-auto",
            "w-full min-w-[32rem] max-w-4xl"
          )}
          initial={{ y: 32, opacity: 0, scale: 0.95 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          exit={{ y: 32, opacity: 0, scale: 0.95 }}
          animate={{
            x: shakeKey > 0 ? currentShakePattern.x : 0,
            y: shakeKey > 0 ? currentShakePattern.y : 0,
            rotate: shakeKey > 0 ? currentShakePattern.rotate : 0
          }}
          transition={{
            type: shakeKey > 0 ? "tween" : "spring",
            duration: shakeKey > 0 ? currentShakePattern.duration : 0.3,
            ease: shakeKey > 0 ? (currentShakePattern.ease as "easeIn" | "easeOut" | "easeInOut") : "easeOut",
            stiffness: shakeKey > 0 ? undefined : 400,
            damping: shakeKey > 0 ? undefined : 25,
            mass: shakeKey > 0 ? undefined : 0.8
          }}
        >
          <div className="flex h-12 items-center justify-between rounded-2xl border bg-white p-1 pl-3 shadow-lg">
            <span className="text-sm font-medium">{message}</span>
            <div className="ml-4 flex gap-2">
              <Button onClick={onReset} variant="ghost" size="lg" className="rounded-lg">
                Reset
              </Button>
              <Button onClick={onSave} variant="default" size="lg" className="rounded-lg">
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof window === "undefined") return content
  return createPortal(content, document.body)
}


function Dialog({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props}>{children}</DialogPrimitive.Root>
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function isFromToast(e: Event) {
  const toastEl = document.getElementById("unsaved-toast")
  if (!toastEl) return false
  const path = (e as unknown as { composedPath?: () => EventTarget[] }).composedPath?.() as EventTarget[] | undefined
  return path ? path.some((n) => n instanceof Node && toastEl.contains(n as Node)) : false
}

function DialogContent({
  className,
  children,
  toast,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  toast?: { message?: string; onSave?: () => Promise<void>; onReset?: () => void; show?: boolean }
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        onInteractOutside={(e) => {
          if (isFromToast(e.detail?.originalEvent ?? e as unknown as Event)) {
            e.preventDefault()
          }
        }}
        onPointerDownOutside={(e) => {
          if (isFromToast(e.detail?.originalEvent ?? e as unknown as Event)) {
            e.preventDefault()
          }
        }}
        {...props}
      >
        {children}

        {/* Render toast inline but make it invisible and non-interactive */}
        {toast && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60">
              <div className={cn(
                "transition-all duration-300 ease-in-out",
                toast.show
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              )}>
                <DialogToast {...toast} />
              </div>
            </div>
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogToast,
}
