"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDelete({ open, onOpenChange, onConfirm, loading }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => Promise<void> | void; loading?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">Delete this post?</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">This action cannot be undone.</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!!loading}>{loading ? "Deleting…" : "Delete"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
