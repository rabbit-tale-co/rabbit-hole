"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface RabbitHoleMember {
  id: string;
  role: "member" | "moderator" | "admin" | "owner";
  joined_at: string;
  is_liked: boolean;
  liked_at?: string;
  profiles: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export function useRabbitHoleMembers(rabbitHoleId?: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<RabbitHoleMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!user || !rabbitHoleId) return;

    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch(`/api/rabbit-holes/members?rabbit_hole_id=${rabbitHoleId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch members: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const joinRabbitHole = async (rabbitHoleId: string, role: "member" | "moderator" | "admin" = "member") => {
    if (!user) return false;

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch("/api/rabbit-holes/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ rabbit_hole_id: rabbitHoleId, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to join rabbit hole: ${response.status} - ${errorText}`);
      }

      // Refresh members list
      await fetchMembers();
      return true;
    } catch (err) {
      console.error("Error joining rabbit hole:", err);
      setError(err instanceof Error ? err.message : "Failed to join rabbit hole");
      return false;
    }
  };

  const leaveRabbitHole = async (rabbitHoleId: string) => {
    if (!user) return false;

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch(`/api/rabbit-holes/members?rabbit_hole_id=${rabbitHoleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to leave rabbit hole: ${response.status} - ${errorText}`);
      }

      // Refresh members list
      await fetchMembers();
      return true;
    } catch (err) {
      console.error("Error leaving rabbit hole:", err);
      setError(err instanceof Error ? err.message : "Failed to leave rabbit hole");
      return false;
    }
  };

  const toggleLike = async (rabbitHoleId: string, isLiked: boolean) => {
    if (!user) return false;

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch("/api/rabbit-holes/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ rabbit_hole_id: rabbitHoleId, is_liked: isLiked }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle like: ${response.status} - ${errorText}`);
      }

      // Refresh members list
      await fetchMembers();
      return true;
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle like");
      return false;
    }
  };

  useEffect(() => {
    if (rabbitHoleId) {
      fetchMembers();
    }
  }, [user, rabbitHoleId]);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    joinRabbitHole,
    leaveRabbitHole,
    toggleLike,
  };
}
