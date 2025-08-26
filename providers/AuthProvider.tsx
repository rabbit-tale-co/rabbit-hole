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

      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        // cleanup previous channel when auth state changes
        if (profileChannel) {
          try { await profileChannel.unsubscribe(); } catch { }
          profileChannel = null;
        }
        if (sess?.user?.id) {
          // ensure profile row exists and accent_color is set
          try {
            await fetch("/api/profile/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: sess.user.id }),
            });
          } catch { }
          const { data: p } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", sess.user.id)
            .maybeSingle();
          setProfile((p as ProfileRow) ?? null);
          // subscribe after refetch
          profileChannel = supabase
            .channel("profile-updates")
            .on(
              "postgres_changes",
              { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${sess.user.id}` },
              (payload) => {
                setProfile(payload.new as ProfileRow);
              }
            )
            .subscribe();
        } else {
          setProfile(null);
        }
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

  const signUp: AuthCtx["signUp"] = async (params) => {
    const { email, password, ...meta } = params;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return { error: error.message };

    // Hit init endpoint once user exists to mirror profile row.
    try {
      await fetch("/api/profile/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.user?.id,
          username: meta.username,
        }),
      });
    } catch { }

    // Supabase may require email confirm depending on project settings.
    return {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const value = useMemo<AuthCtx>(() => ({
    user, session, loading, profile,
    refreshProfile, signIn, signUp, signOut
  }), [user, session, loading, profile, refreshProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
