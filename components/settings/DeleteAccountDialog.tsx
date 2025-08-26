"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeleteAccountDialog({
  open,
  onOpenChange,
  expected,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  expected: string;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}) {
  const [value, setValue] = React.useState("");
  const canConfirm = value === expected;

  React.useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This will permanently remove your profile, posts, likes, bookmarks, reposts and comments. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">To confirm, type your username &quot;<span className="font-bold">{expected}</span>&quot; below:</p>
          <Input
            autoFocus
            placeholder={expected}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => onConfirm()}
            disabled={!canConfirm || !!loading}
          >
            {loading ? "Deleting…" : "Delete account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
