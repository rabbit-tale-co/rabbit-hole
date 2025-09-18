"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function DeleteRabbitHoleDialog({
  open,
  onOpenChange,
  expected,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  expected: string; // typically rabbit hole url/slug
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
          <DialogTitle>Delete this rabbit hole?</DialogTitle>
          <DialogDescription>
            This will permanently remove this rabbit hole and all related data
            (membership, order, stats). This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            To confirm, type its URL slug "<span className="font-bold">{expected}</span>" below:
          </p>
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
            {loading ? "Deleting…" : "Delete rabbit hole"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


