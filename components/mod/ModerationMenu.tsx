"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BanUserDialog } from "@/app/post/[id]/BanUserDialog";
import { adminUnbanUser } from "@/app/actions/admin";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { OutlineMore } from "../icons/Icons";

export function ModerationMenu({ targetUserId, isSuspended, onAfter }: { targetUserId: string; isSuspended: boolean; onAfter?: (action: "suspend" | "unban") => void; }) {
  const [openSuspend, setOpenSuspend] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function handleUnban() {
    try {
      setBusy(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const r = await adminUnbanUser(targetUserId, token);
      const err = (r as unknown as { error?: string }).error;
      if (err) { toast.error(err); return; }
      toast.success("User unbanned");
      onAfter?.("unban");
      try { window.dispatchEvent(new CustomEvent("profile:updated")); } catch { }
    } catch {
      toast.error("Failed to unban user");
    } finally { setBusy(false); }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Moderator actions">
            <OutlineMore />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Moderation</DropdownMenuLabel>
          {!isSuspended && (
            <DropdownMenuItem onClick={() => setOpenSuspend(true)} disabled={busy}>Suspend…</DropdownMenuItem>
          )}
          {isSuspended && (
            <DropdownMenuItem onClick={handleUnban} disabled={busy}>Unban</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {!isSuspended && (
        <BanUserDialog open={openSuspend} onOpenChange={setOpenSuspend} userId={targetUserId} />
      )}
    </>
  );
}
