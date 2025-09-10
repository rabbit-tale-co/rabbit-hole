"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import type { AuthCtx } from "@/types/auth";
import type { ProfileRow } from "@/types/db";

const Ctx = createContext<AuthCtx | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
          .schema("social_art")
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
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `user_id=eq.${data.session.user.id}`,
            },
            (payload) => {
              setProfile(payload.new as ProfileRow);
            },
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
            try {
              profileChannel.unsubscribe();
            } catch { }
            profileChannel = null;
          }
          if (sess?.user?.id) {
            // ensure profile row exists then fetch it
            // Try to get username from user_metadata
            const username = sess.user.user_metadata?.username;

            const body: { username?: string } = {};
            if (username) {
              body.username = username;
            }

            fetch("/api/profile/init", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sess.access_token}`,
              },
              body: JSON.stringify(body),
            }).catch(() => { });
            (async () => {
              try {
                const { data: p } = await supabase
                  .schema("social_art")
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
                {
                  event: "UPDATE",
                  schema: "public",
                  table: "profiles",
                  filter: `user_id=eq.${sess.user.id}`,
                },
                (payload) => {
                  setProfile(payload.new as ProfileRow);
                },
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
      .schema("social_art")
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((p as ProfileRow) ?? null);
  }, [user?.id]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      // Refresh profile data
      await refreshProfile();
      // Also refresh user data (for email updates)
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    window.addEventListener("profile:updated", handleProfileUpdate);
    return () => window.removeEventListener("profile:updated", handleProfileUpdate);
  }, [refreshProfile]);

  const signIn: AuthCtx["signIn"] = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    // session listener updates state
    return {};
  }, []);

  const resetPassword: AuthCtx["resetPassword"] = useCallback(async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { error: error.message };
      return {};
    } catch (e: unknown) {
      return {
        error: e instanceof Error ? e.message : "Failed to send reset email.",
      };
    }
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback(async (params) => {
    const { email, password, ...meta } = params;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: meta.username,
          display_name: meta.display_name,
        },
      },
    });
    if (error) return { error: error.message };

    // Only try to initialize profile if we have a session (no email confirmation required)
    if (data.session?.access_token) {
      try {
        const res = await fetch("/api/profile/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({
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
      } catch {
        // Handle error silently
      }
    }
    // If no session (email confirmation required), profile will be initialized on first login
    return {};
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch { }
    try {
      // Clear local state proactively; the onAuthStateChange may not fire in some edge cases
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch { }
  }, []);

  // Get JWT token for API calls
  const getToken = useCallback(async () => {
    if (!session?.access_token) return null;
    return session.access_token;
  }, [session?.access_token]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      session,
      loading,
      profile,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      resetPassword,
      getToken,
    }),
    [
      user,
      session,
      loading,
      profile,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      resetPassword,
      getToken,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
