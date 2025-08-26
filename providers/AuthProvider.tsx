"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthCtx } from "@/types/auth";

const Ctx = createContext<AuthCtx | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // boot
  useEffect(() => {
    let unsub = () => { };
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
      });
      unsub = sub.subscription.unsubscribe;
    })();
    return () => unsub();
  }, []);

  // API calls
  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // session listener updates state
    return {};
  };

  const signUp: AuthCtx["signUp"] = async (params) => {
    const { email, password, ...meta } = params;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ...meta, is_premium: false } }, // raw_user_meta_data
    });
    if (error) return { error: error.message };

    // Hit init endpoint once user exists to mirror profile row.
    try {
      await fetch("/api/profile/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user?.id,
          meta: { username: meta.username, display_name: meta.display_name, is_premium: false },
        }),
      });
    } catch { }

    // Supabase may require email confirm depending on project settings.
    return {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const value = useMemo<AuthCtx>(() => ({
    user, session, loading, signIn, signUp, signOut
  }), [user, session, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
