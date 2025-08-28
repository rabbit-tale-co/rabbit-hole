"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import ShowPassword from "./ShowPassword";
import Link from "next/link";

export default function LoginForm({ onSuccess, onForgot }: { onSuccess?: () => void; onForgot?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 max-w-md`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}


      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs">Password</Label>
        <InputGroup>
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pr-10"
          />
          <InputAddon className="px-0">
            <ShowPassword showPwd={showPwd} setShowPwd={setShowPwd} />
          </InputAddon>
        </InputGroup>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>) : "Sign in"}
      </Button>

      <div className="flex items-center justify-end text-xs">
        {onForgot ? (
          <button type="button" onClick={onForgot} className="text-muted-foreground underline underline-offset-2">Forgot password?</button>
        ) : (
          <Link href="/auth/forgot-password" className="text-muted-foreground underline underline-offset-2">Forgot password?</Link>
        )}
      </div>
      {/* success message handled on dedicated /auth/forgot-password page */}
    </form>
  );
}
