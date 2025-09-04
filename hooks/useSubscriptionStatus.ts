import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionStatus: string;
  plan: string | null;
  nextBillingDate: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  lastChecked: string;
  loading: boolean;
  error: string | null;
}

export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    subscriptionStatus: 'none',
    plan: null,
    nextBillingDate: null,
    customerId: null,
    subscriptionId: null,
    lastChecked: '',
    loading: true,
    error: null,
  });

  const checkSubscriptionStatus = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setStatus(prev => ({ ...prev, loading: false, error: 'No user logged in' }));
      return;
    }

    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const method = forceRefresh ? 'POST' : 'GET';
      const response = await fetch(`/api/user/subscription-status?userId=${user.id}`, {
        method,
        headers: forceRefresh ? { 'Content-Type': 'application/json' } : {},
        body: forceRefresh ? JSON.stringify({ userId: user.id }) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Failed to check subscription status: ${response.status}`);
      }

      const data = await response.json();

      setStatus({
        isPremium: data.isPremium,
        subscriptionStatus: data.subscriptionStatus,
        plan: data.plan,
        nextBillingDate: data.nextBillingDate,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        lastChecked: data.lastChecked,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Subscription status check error:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [user?.id]);

  const refreshSubscriptionStatus = useCallback(() => {
    checkSubscriptionStatus(true);
  }, [checkSubscriptionStatus]);

  // Check subscription status on mount and when user changes
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      checkSubscriptionStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id, checkSubscriptionStatus]);

  return {
    ...status,
    refreshSubscriptionStatus,
    checkSubscriptionStatus: () => checkSubscriptionStatus(false),
  };
}
