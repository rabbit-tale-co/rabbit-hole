"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Center from "@/components/Center";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function withTimeout<T>(p: Promise<T>, ms = 20000, label = "timeout"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    console.log(password);
    console.log(confirm);

    if (password !== confirm) { setError("Passwords do not match."); return; }


    setLoading(true);
    try {
      // Ensure recovery session exists, otherwise updateUser may hang on some setups
      const pre = await withTimeout(supabase.auth.getUser(), 10000, "auth_preflight_timeout");
      console.log("preflight user:", pre.data?.user?.id || null);
      if (!pre.data?.user) {
        setError("No recovery session. Open the link from your email again.");
        return;
      }

      try {
        const { data, error: updErr } = await withTimeout(
          supabase.auth.updateUser({ password: password }),
          20000,
          "auth_update_timeout"
        );
        console.log("updateUser data:", data);
        if (updErr) {
          console.error("updateUser error:", updErr);
          setError(updErr.message);
          toast.error(updErr.message);
          return;
        }
      } catch (sdkErr) {
        console.warn("updateUser timed out or failed, using REST fallback", sdkErr);
        const { data: s } = await supabase.auth.getSession();
        const access_token = s?.session?.access_token;
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!access_token) { setError("Missing access token for fallback."); return; }
        if (!url || !anon) { setError("Missing Supabase env for fallback."); return; }

        const resp = await withTimeout(fetch(`${url}/auth/v1/user`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`,
            "apikey": anon,
          },
          body: JSON.stringify({ password }),
        }), 20000, "auth_rest_timeout");

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`Auth REST ${resp.status}: ${txt || resp.statusText}`);
        }
      }

      try { await withTimeout(supabase.auth.refreshSession(), 5000, "refresh_timeout"); } catch (e) { console.warn(e); }
      toast.success("Password updated");
      router.replace("/");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Password update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center>
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-lg font-semibold">Set a new password</h1>
        {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
        <>
          <div className="space-y-1">
            <Label htmlFor="pwd" className="text-xs">New password</Label>
            <Input id="pwd" type="password" required minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm" className="text-xs">Confirm password</Label>
            <Input id="confirm" type="password" required minLength={8}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </>
      </form>
    </Center>
  );
}
