"use client";

import { useState, useEffect } from "react";

interface RabbitHoleOrder {
  id: string;
  order: number;
}

export function useRabbitHoleOrder() {
  const [order, setOrder] = useState<RabbitHoleOrder[]>([]);

  // Load order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem("rabbit-hole-order");
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (error) {
        console.error("Failed to parse rabbit hole order:", error);
      }
    }
  }, []);

  // Save order to localStorage whenever it changes
  useEffect(() => {
    if (order.length > 0) {
      localStorage.setItem("rabbit-hole-order", JSON.stringify(order));
    }
  }, [order]);

  const updateOrder = (newOrder: RabbitHoleOrder[]) => {
    setOrder(newOrder);
  };

  const getOrderedItems = <T extends { id: string }>(items: T[]): T[] => {
    if (order.length === 0) return items;

    return items.sort((a, b) => {
      const orderA = order.find(o => o.id === a.id)?.order ?? 999;
      const orderB = order.find(o => o.id === b.id)?.order ?? 999;
      return orderA - orderB;
    });
  };

  return {
    order,
    updateOrder,
    getOrderedItems
  };
}
