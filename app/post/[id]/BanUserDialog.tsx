"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { adminBanUser } from "@/app/actions/admin";
import { supabase } from "@/lib/supabase";
import { OutlineClose } from "@/components/icons/Icons";
import { Loader2 } from "lucide-react";

type Mode = "duration" | "until" | "permanent";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function BanUserDialog({ open, onOpenChange, userId }: BanUserDialogProps) {
  const [mode, setMode] = React.useState<Mode>("duration");
  const [busy, setBusy] = React.useState(false);

  // Duration mode
  const [durationDays, setDurationDays] = React.useState<number>(7);

  // Until mode
  const [date, setDate] = React.useState<Date | undefined>(() => new Date(Date.now() + 7 * 86_400_000));
  const [time, setTime] = React.useState<string>("12:00");

  // Permanent confirm
  const [confirmText, setConfirmText] = React.useState("");

  // Context
  const [reason, setReason] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  const tz = React.useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const tzOffset = React.useMemo(() => {
    const m = -new Date().getTimezoneOffset();
    const sign = m >= 0 ? "+" : "-";
    const hh = String(Math.floor(Math.abs(m) / 60)).padStart(2, "0");
    const mm = String(Math.abs(m) % 60).padStart(2, "0");
    return `UTC${sign}${hh}:${mm}`;
  }, []);

  function clampToFuture(d: Date): Date {
    return d.getTime() > Date.now() ? d : new Date(Date.now() + 60_000);
  }

  function buildTargetDate(): Date {
    if (mode === "permanent") return new Date("9999-12-31T23:59:59.000Z");
    if (mode === "duration") return new Date(Date.now() + Math.max(1, durationDays) * 86_400_000);
    const base = date ?? new Date();
    const [hh, mm] = (time || "12:00").split(":");
    const dt = new Date(base);
    dt.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
    return clampToFuture(dt);
  }

  const target = buildTargetDate();
  const targetIso = target.toISOString();
  const isPermanent = mode === "permanent";
  const isUntilInvalid = mode === "until" && target.getTime() <= Date.now();

  const confirmDisabled =
    busy ||
    (mode === "until" && isUntilInvalid) ||
    (mode === "duration" && (!Number.isFinite(durationDays) || durationDays <= 0)) ||
    (mode === "permanent" && confirmText !== "BAN");

  function applyQuick(days: number) {
    setMode("duration");
    setDurationDays(days);
  }

  async function onConfirm() {
    try {
      setBusy(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const r = await adminBanUser(userId, targetIso, reason, notes, token);
      const err = (r as unknown as { error?: string }).error;
      if (err) return toast.error(err);
      toast.success(
        isPermanent
          ? "Account suspended permanently"
          : `Account suspended until ${target.toLocaleString(undefined, { timeZone: tz, timeZoneName: "short" })}`
      );
      onOpenChange(false);
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    } catch {
      toast.error("Failed to suspend account");
    } finally {
      setBusy(false);
    }
  }

  const segmented = (k: Mode, label: string) => (
    <Button
      type="button"
      key={k}
      size="sm"
      variant={mode === k ? "default" : "outline"}
      className={cn("h-8 rounded-md", mode === k ? "shadow-sm" : "opacity-90")}
      onClick={() => setMode(k)}
      disabled={busy}
    >
      {label}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[700px]" aria-busy={busy}>
        <DialogHeader className="space-y-1">
          <DialogTitle className="pr-10">Suspend account</DialogTitle>
          <DialogDescription>Choose how long, add a reason, and confirm.</DialogDescription>
          <DialogClose asChild className="absolute top-2 right-2">
            <Button variant="ghost" size="icon" disabled={busy} aria-label="Close">
              <OutlineClose className="size-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode segmented control */}
          <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
            {segmented("duration", "Duration")}
            {segmented("until", "Until date")}
            {segmented("permanent", "Permanent")}
          </div>

          {/* Duration mode */}
          {mode === "duration" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Quick presets:</span>
                <Button size="sm" variant="secondary" onClick={() => applyQuick(1)} disabled={busy}>
                  24 hours
                </Button>
                <Button size="sm" variant="secondary" onClick={() => applyQuick(7)} disabled={busy}>
                  7 days
                </Button>
                <Button size="sm" variant="secondary" onClick={() => applyQuick(30)} disabled={busy}>
                  30 days
                </Button>
                <Button size="sm" variant="secondary" onClick={() => applyQuick(90)} disabled={busy}>
                  90 days
                </Button>
              </div>

              <div className="grid max-w-[420px] grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="durationDays">Days</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    disabled={busy}
                  />
                </div>
                <div className="self-end text-xs text-muted-foreground">
                  Ends on:&nbsp;
                  <span className="font-medium">
                    {new Date(Date.now() + Math.max(1, durationDays) * 86_400_000).toLocaleString(undefined, {
                      timeZone: tz,
                      timeZoneName: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Until mode */}
          {mode === "until" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <Calendar
                  mode="single"               // ✅ required for selection
                  selected={date}
                  onSelect={(d) => setDate(d || new Date())}
                  captionLayout="dropdown"    // ✅ needs fromYear/toYear
                  fromYear={2020}
                  toYear={2035}
                  showOutsideDays
                  initialFocus                // nicer keyboard focus
                  className="w-full"
                  disabled={(d: Date) => {
                    const day = new Date(d);
                    day.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return day.getTime() < today.getTime();  // block past days
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time (local)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={busy}
                  />
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Will suspend until:&nbsp;
                    <span className="font-medium">
                      {target.toLocaleString(undefined, { timeZone: tz, timeZoneName: "short" })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{tz} • {tzOffset}</span>
                    <code className="rounded bg-muted px-1 py-0.5">{targetIso}</code>
                  </div>
                </div>

                {isUntilInvalid && (
                  <div className="text-xs text-destructive">
                    The selected date/time is in the past. Please choose a future time.
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Permanent mode */}
          {mode === "permanent" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This permanently suspends the account (can be lifted by an admin).
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="confirmBan">
                    Type <span className="font-mono">&quot;BAN&quot;</span> to confirm
                  </Label>
                  <Input
                    id="confirmBan"
                    placeholder="BAN"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="self-end text-xs text-muted-foreground">
                  Effective until:&nbsp;<span className="font-medium">{target.toUTCString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reason & notes */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason (short)</Label>
              <Input
                id="reason"
                placeholder="Spam / Abuse / ToS violation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (internal, optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add moderator context for the audit log…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-[92px]"
                disabled={busy}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Mode</div>
              <div className="font-medium capitalize">{mode}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Until (local)</div>
              <div className="font-medium">
                {target.toLocaleString(undefined, { timeZone: tz, timeZoneName: "short" })}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Until (UTC)</div>
              <div className="font-medium">{target.toUTCString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">ISO</div>
              <div className="font-mono break-all text-xs">{targetIso}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={busy}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onConfirm}
            variant="destructive"
            disabled={confirmDisabled}
            className={cn("min-w-[112px]", busy && "opacity-80")}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Applying…
              </span>
            ) : (
              "Suspend"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
