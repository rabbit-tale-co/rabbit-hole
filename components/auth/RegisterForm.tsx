"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Mail } from "lucide-react";

export default function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

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
      // If email confirmation is required, we leave the success screen
      // and do not close the modal immediately.
      setSuccess(true);
      onSuccess?.();
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
          className="h-9"
        />
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
          className="h-9"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}
            className="h-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute inset-y-0 right-2 grid place-items-center rounded px-2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" size="sm" className="w-full" disabled={loading}>
        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>)
          : "Create account"}
      </Button>
    </form>
  );
}
