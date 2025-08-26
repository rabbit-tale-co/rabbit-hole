import * as React from "react"
import { toast } from "sonner"
import { Button } from "./button"
import { createPortal } from "react-dom"

interface UnsavedChangesToastProps {
  message?: string
  onSave?: () => Promise<void>
  onReset?: () => void
  toastId?: string | number | null
  onToastDismiss?: () => void
}

export function UnsavedChangesToast({
  message = "You have unsaved changes",
  onSave,
  onReset,
  toastId,
  onToastDismiss,
}: UnsavedChangesToastProps) {
  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave()
        if (toastId) {
          toast.dismiss(toastId)
          onToastDismiss?.()
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
      if (toastId) {
        toast.dismiss(toastId)
        onToastDismiss?.()
      }
    }
  }

  const toastContent = (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-between w-full p-1 pl-3 h-12 bg-white rounded-2xl shadow-lg border min-w-[32rem] max-w-4xl z-[999999]"
    >
      <span className="text-sm font-medium">{message}</span>
      <div className="flex gap-2 ml-4">
        <Button
          onClick={handleReset}
          variant="ghost"
          size="lg"
          className="rounded-lg"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          variant="default"
          size="lg"
          className="rounded-lg"
        >
          Save Changes
        </Button>
      </div>
    </div>
  )

  // Use portal to render directly in the body
  if (typeof window !== 'undefined') {
    return createPortal(toastContent, document.body)
  }

  return toastContent
}

// Hook to manage unsaved changes toast
export function useUnsavedChangesToast({
  message = "Careful — you have unsaved changes!",
  onSave,
  onReset
}: {
  message?: string
  onSave?: () => Promise<void>
  onReset?: () => void
}) {
  const [hasChanges, setHasChanges] = React.useState(false)

  const markAsChanged = React.useCallback(() => {
    setHasChanges(true)
  }, [])

  const markAsSaved = React.useCallback(() => {
    setHasChanges(false)
  }, [])

  const resetChanges = React.useCallback(() => {
    setHasChanges(false)
  }, [])

  return {
    hasChanges,
    markAsChanged,
    markAsSaved,
    resetChanges,
    // Render the toast when there are changes
    unsavedToast: hasChanges ? (
      <UnsavedChangesToast
        message={message}
        onSave={onSave}
        onReset={onReset}
        onToastDismiss={() => setHasChanges(false)}
      />
    ) : null
  }
}
