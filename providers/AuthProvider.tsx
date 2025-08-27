"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthCtx } from "@/types/auth";
import type { ProfileRow } from "@/types/db";

const Ctx = createContext<AuthCtx | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  // boot
  useEffect(() => {
    let unsub = () => { };
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      if (data.session?.user?.id) {
        // fetch profile from public view (RLS allows select)
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.session.user.id)
          .maybeSingle();
        setProfile((p as ProfileRow) ?? null);
        // load local accent override
        // subscribe to realtime updates on this profile
        profileChannel = supabase
          .channel("profile-updates")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${data.session.user.id}` },
            (payload) => {
              setProfile(payload.new as ProfileRow);
            }
          )
          .subscribe();
      } else {
        setProfile(null);
      }
      setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        // Defer all async work to avoid deadlocks per Supabase guidance
        setTimeout(() => {
          // cleanup previous channel when auth state changes
          if (profileChannel) {
            try { profileChannel.unsubscribe(); } catch { }
            profileChannel = null;
          }
          if (sess?.user?.id) {
            // ensure profile row exists then fetch it
            fetch("/api/profile/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: sess.user.id }),
            }).catch(() => { });

            (async () => {
              try {
                const { data: p } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("user_id", sess.user.id)
                  .maybeSingle();
                setProfile((p as ProfileRow) ?? null);
              } catch {
                setProfile(null);
              }
            })();

            profileChannel = supabase
              .channel("profile-updates")
              .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${sess.user.id}` },
                (payload) => { setProfile(payload.new as ProfileRow); }
              )
              .subscribe();
          } else {
            setProfile(null);
          }
        }, 0);
      });
      unsub = sub.subscription.unsubscribe;
    })();
    return () => unsub();
  }, []);

  // API calls
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((p as ProfileRow) ?? null);
  }, [user?.id]);
  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // session listener updates state
    return {};
  };

  const resetPassword: AuthCtx["resetPassword"] = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "Failed to send reset email." };
    }
  };

  useEffect(() => {
    let alive = true;
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);

      // ...fetch profile...
      if (data.session?.user?.id) {
        // unikalna nazwa kanału
        profileChannel = supabase
          .channel(`profile-updates:${data.session.user.id}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${data.session.user.id}` },
            (payload) => { if (alive) setProfile(payload.new as ProfileRow); }
          )
          .subscribe();
      } else {
        setProfile(null);
      }
      if (alive) setLoading(false);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
        if (!alive) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        // Defer async work to avoid deadlocks
        setTimeout(() => {
          if (!alive) return;
          if (profileChannel) { try { profileChannel.unsubscribe(); } catch { } profileChannel = null; }

          if (sess?.user?.id) {
            fetch("/api/profile/init", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: sess.user.id }) }).catch(() => { });
            (async () => {
              try {
                const { data: p } = await supabase.from("profiles").select("*").eq("user_id", sess.user.id).maybeSingle();
                if (alive) setProfile((p as ProfileRow) ?? null);
              } catch {
                if (alive) setProfile(null);
              }
            })();

            profileChannel = supabase
              .channel(`profile-updates:${sess.user.id}`)
              .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${sess.user.id}` },
                (payload) => { if (alive) setProfile(payload.new as ProfileRow); }
              )
              .subscribe();
          } else {
            setProfile(null);
          }
        }, 0);
      });

      // pewny cleanup
      return () => {
        alive = false;
        try { sub.subscription.unsubscribe(); } catch { }
        if (profileChannel) { try { profileChannel.unsubscribe(); } catch { } }
      };
    })();
  }, []);

  const signUp: AuthCtx["signUp"] = async (params) => {
    const { email, password, ...meta } = params;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return { error: error.message };

    // Hit init endpoint once user exists to mirror profile row.
    try {
      const res = await fetch("/api/profile/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user?.id,
          username: meta.username,
        }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          return { error: "Username is already taken." };
        }
        let message = "Failed to initialize profile.";
        try {
          const j = await res.json();
          if (j?.error && typeof j.error === "string") message = j.error;
        } catch { }
        return { error: message };
      }
    } catch { }

    // Supabase may require email confirm depending on project settings.
    return {};
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch { }
    try {
      // Clear local state proactively; the onAuthStateChange may not fire in some edge cases
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch { }
    try {
      // Clear auth cookies in browser scope if any were left
      // This is a no-op on many setups but helps with sticky sessions
      document.cookie = "sb-access-token=; Max-Age=0; path=/";
      document.cookie = "sb-refresh-token=; Max-Age=0; path=/";
    } catch { }
  };

  const value = useMemo<AuthCtx>(() => ({
    user, session, loading, profile,
    refreshProfile, signIn, signUp, signOut,
    resetPassword
  }), [user, session, loading, profile, refreshProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
