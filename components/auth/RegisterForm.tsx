"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";
import ShowPassword from "./ShowPassword";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const usernamePattern = useMemo(() => /^[a-z0-9_]{3,20}$/i, []);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameHelper, setUsernameHelper] = useState<string | null>(null);

  // Debounced availability check
  useEffect(() => {
    let alive = true;
    const candidate = username.trim().toLowerCase();
    if (!candidate || !usernamePattern.test(candidate)) {
      setUsernameStatus("idle");
      setUsernameHelper(null);
      return;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(candidate)}`);
        if (!alive) return;
        if (res.status === 404) {
          setUsernameStatus("available");
          setUsernameHelper(null);
        } else if (res.ok) {
          setUsernameStatus("taken");
          setUsernameHelper("This username is already taken.");
        } else {
          setUsernameStatus("idle");
          setUsernameHelper(null);
        }
      } catch {
        if (!alive) return;
        setUsernameStatus("idle");
        setUsernameHelper(null);
      }
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [username, usernamePattern]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      setLoading(false);
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!usernamePattern.test(cleanUsername)) {
      setLoading(false);
      setError("Username must be 3-20 chars: letters, numbers, underscore.");
      return;
    }

    if (usernameStatus === "taken") {
      setLoading(false);
      setError("This username is already taken.");
      return;
    }

    // Prevent browsers from autofilling email into username or the same value
    if (email && cleanUsername === email.trim().toLowerCase()) {
      setLoading(false);
      setError("Username cannot be the same as email.");
      return;
    }

    // We don’t collect display_name in this compact form; derive it from username.
    const { error } = await signUp({
      email,
      password,
      username: cleanUsername,
      display_name: cleanUsername,
      // Optional: accent/avatars could be added later
    });

    setLoading(false);

    if (error) {
      setError(error);
    } else {
      // If email confirmation is required, show success screen and keep dialog open.
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className={`text-center space-y-4 max-w-md`}>
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
          <p className="text-sm text-gray-600 mb-4">
            We&apos;ve sent a confirmation link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-xs text-gray-500">
            Click the link in your email to complete your registration and sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 max-w-md`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="username" className="text-xs">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="yourname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={20}
          disabled={loading}
          autoComplete="username"
        />
        {usernameHelper && (
          <p className="text-[10px] mt-1 text-red-500">{usernameHelper}</p>
        )}
      </div>

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
          autoComplete="email"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs">Password</Label>
        <InputGroup>
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}

          />
          <InputAddon className="px-0">
            <ShowPassword showPwd={showPwd} setShowPwd={setShowPwd} />
          </InputAddon>
        </InputGroup>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>)
          : "Create account"}
      </Button>
    </form>
  );
}
