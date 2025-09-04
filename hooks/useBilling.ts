import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface BillingState {
  isLoading: boolean;
  error: string | null;
}

interface Entitlements {
  isPremium: boolean;
}

interface UseBillingReturn {
  // State
  isLoading: boolean;
  error: string | null;
  entitlements: Entitlements | null;

  // Actions
  checkout: (priceId?: string) => Promise<void>;
  openPortal: () => Promise<void>;
  fetchEntitlements: () => Promise<void>;
  clearError: () => void;
}

export function useBilling(): UseBillingReturn {
  const [state, setState] = useState<BillingState>({
    isLoading: false,
    error: null,
  });
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const checkout = useCallback(async (priceId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      setError(errorMessage);
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const openPortal = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create billing portal session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Billing Portal
        window.location.href = url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Portal access failed';
      setError(errorMessage);
      console.error('Portal error:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const fetchEntitlements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/me/entitlements', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch entitlements');
      }

      const data = await response.json();
      setEntitlements(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch entitlements';
      setError(errorMessage);
      console.error('Entitlements error:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    isLoading: state.isLoading,
    error: state.error,
    entitlements,
    checkout,
    openPortal,
    fetchEntitlements,
    clearError,
  };
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication session found');
  }

  return session.access_token;
}
