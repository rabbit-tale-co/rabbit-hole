"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface DiscoverableRabbitHole {
  id: string;
  name: string;
  description: string;
  creator: string;
  likes: number;
  members: number;
  posts: number;
  avatar: string;
  color: string;
  accent_color?: string;
  url: string;
  created_at: string;
}

export function useDiscoverableRabbitHoles(searchQuery?: string) {
  const { user } = useAuth();
  const [rabbitHoles, setRabbitHoles] = useState<DiscoverableRabbitHole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscoverableHoles = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const params = new URLSearchParams();
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      params.set("limit", "20");

      const response = await fetch(`/api/rabbit-holes/discover?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch discoverable rabbit holes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setRabbitHoles(data.rabbitHoles || []);
    } catch (err) {
      console.error("Error fetching discoverable rabbit holes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch discoverable rabbit holes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDiscoverableHoles();
    }
  }, [user, searchQuery]);

  return {
    rabbitHoles,
    loading,
    error,
    refetch: fetchDiscoverableHoles,
  };
}
