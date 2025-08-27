"use client";

import * as React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotForm({ onSent }: { onSent?: (email: string) => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMsg(null); setLoading(true);
    const res = await (resetPassword?.(email) ?? Promise.resolve({ error: "not_supported" }));
    setLoading(false);
    if (res.error) setError(res.error);
    else {
      const text = `We sent a reset link to ${email}. Check your inbox.`;
      setMsg(text);
      onSent?.(email);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-md">
      {error && (
        <Alert variant="destructive"><AlertDescription className="text-xs">{error}</AlertDescription></Alert>
      )}
      {msg && (
        <Alert><AlertDescription className="text-xs">{msg}</AlertDescription></Alert>
      )}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send reset link"}</Button>
    </form>
  );
}
