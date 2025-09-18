"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface RabbitHole {
  id: string;
  name: string;
  url: string; // New unique URL field
  description?: string;
  rules?: string[]; // Changed from string to string[]
  avatar_url?: string;
  cover_url?: string;
  accent_color?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export function useRabbitHoles() {
  const { user } = useAuth();
  const [rabbitHoles, setRabbitHoles] = useState<RabbitHole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRabbitHoles = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch("/api/rabbit-holes", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch rabbit holes: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setRabbitHoles(data.rabbitHoles || []);
    } catch (err) {
      console.error("Error fetching rabbit holes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch rabbit holes");
    } finally {
      setLoading(false);
    }
  };

  const createRabbitHole = async (name: string, url: string, description?: string, rules?: string[]) => {
    if (!user) return null;

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch("/api/rabbit-holes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, url, description, rules }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || "Failed to create rabbit hole");
        (error as any).code = errorData.code;
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      setRabbitHoles(prev => [data.rabbitHole, ...prev]);
      return data; // Return full result including urlGenerated flag
    } catch (err) {
      console.error("Error creating rabbit hole:", err);
      setError(err instanceof Error ? err.message : "Failed to create rabbit hole");
      throw err; // Re-throw to let the component handle it
    }
  };

  const updateRabbitHole = async (id: string, name: string, url: string, description?: string, rules?: string[]) => {
    if (!user) return null;

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const current = rabbitHoles.find((h) => h.id === id);
      if (!current) {
        throw new Error("Rabbit hole not found in local state");
      }
      const response = await fetch(`/api/rabbit-holes/${encodeURIComponent(current.url)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, url, description, rules }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rabbit hole");
      }

      const data = await response.json();
      setRabbitHoles(prev => prev.map(hole => hole.id === id ? data.rabbitHole : hole));
      return data;
    } catch (err) {
      console.error("Error updating rabbit hole:", err);
      setError(err instanceof Error ? err.message : "Failed to update rabbit hole");
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchRabbitHoles();
    }
  }, [user]);

  return {
    rabbitHoles,
    loading,
    error,
    refetch: fetchRabbitHoles,
    createRabbitHole,
    updateRabbitHole,
  };
}
