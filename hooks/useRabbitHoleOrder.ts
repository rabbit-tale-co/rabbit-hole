"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export function useRabbitHoleOrder() {
  const { user } = useAuth();
  const [order, setOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch("/api/rabbit-holes/order", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch order: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setOrder(data.order || []);
    } catch (err) {
      console.error("Error fetching rabbit hole order:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (newOrder: string[]) => {
    if (!user) return false;

    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No session found");
      }

      const response = await fetch("/api/rabbit-holes/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update order: ${response.status} - ${errorText}`);
      }

      setOrder(newOrder);
      return true;
    } catch (err) {
      console.error("Error updating rabbit hole order:", err);
      setError(err instanceof Error ? err.message : "Failed to update order");
      return false;
    }
  };

  const getOrderedItems = <T extends { id: string }>(items: T[]): T[] => {
    if (order.length === 0) return items;

    const orderedItems: T[] = [];
    const remainingItems = [...items];

    // Add items in the order specified by the order array
    order.forEach(id => {
      const item = remainingItems.find(item => item.id === id);
      if (item) {
        orderedItems.push(item);
        const index = remainingItems.indexOf(item);
        remainingItems.splice(index, 1);
      }
    });

    // Add any remaining items that weren't in the order
    orderedItems.push(...remainingItems);

    return orderedItems;
  };

  useEffect(() => {
    if (user) {
      fetchOrder();
    }
  }, [user]);

  return {
    order,
    loading,
    error,
    updateOrder,
    getOrderedItems,
    refetch: fetchOrder,
  };
}
