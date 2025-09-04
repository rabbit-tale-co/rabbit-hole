'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  // Outline icons only ✅
  OutlineWarning,
  OutlineTrash,
  OutlineLoading,
} from '@/components/icons/Icons';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { Badge } from '../ui/badge';

interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  description: string;
  invoice_url?: string;
}

interface BillingData {
  currentSubscription: {
    id: string;
    status: string;
    plan: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at?: string;
    cancellation_reason?: string | null;
  } | null;
  billingHistory: BillingHistoryItem[];
  message?: string;
}

function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

const statusChip = (s: string) => {
  const base = "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium";
  switch (s) {
    case "paid": return <span className={`${base} bg-green-100 text-green-700`}>PAID</span>;
    case "open":
    case "unpaid": return <span className={`${base} bg-amber-100 text-amber-700`}>{s.toUpperCase()}</span>;
    case "failed": return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
    case "refunded": return <span className={`${base} bg-blue-100 text-blue-700`}>REFUNDED</span>;
    case "void": return <span className={`${base} bg-neutral-100 text-neutral-700`}>VOID</span>;
    default: return <Badge>{s}</Badge>;
  }
};

const subscriptionStatusChip = (status: string, isCanceling: boolean) => {
  if (isCanceling) {
    return <Badge className={"bg-orange-100 text-orange-700 !text-xs"}>CANCELING</Badge>;
  }
  switch (status) {
    case "active": return <Badge className={"bg-green-100 text-green-700 !text-xs"}>ACTIVE</Badge>;
    case "trialing": return <Badge className={"bg-blue-100 text-blue-700 !text-xs"}>TRIALING</Badge>;
    case "canceled":
    case "cancelled": return <Badge className={"bg-red-100 text-red-700 !text-xs"}>CANCELED</Badge>;
    case "past_due": return <Badge className={"bg-amber-100 text-amber-700 !text-xs"}>PAST DUE</Badge>;
    case "unpaid": return <Badge className={"bg-red-100 text-red-700 !text-xs"}>UNPAID</Badge>;
    default: return <Badge className={"!text-xs"}>{status}</Badge>;
  }
};

// const subscriptionStatusIcon = (s: string) =>
//   s === 'active' ? (
//     <OutlineCheck size={20} />
//   ) : s === 'trialing' ? (
//     <OutlineCheck className="text-blue-600" size={20} />
//   ) : s === 'canceled' || s === 'cancelled' ? (
//     <OutlineClose className="text-red-600" size={20} />
//   ) : (
//     <OutlineWarning className="text-amber-600" size={20} />
//   );

export default function BillingSettings() {
  const { user } = useAuth();
  const {
    isPremium,
    subscriptionStatus,
    plan,
    nextBillingDate,
    customerId,
    subscriptionId,
    loading,
    error,
    refreshSubscriptionStatus,
  } = useSubscriptionStatus();

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching billing data for user:', user.id);
      const res = await fetch(`/api/user/billing?userId=${user.id}`);
      console.log('Billing API response status:', res.status);

      const data = await res.json();
      console.log('Billing API response data:', data);

      if (res.ok) {
        setBillingData(data);
        // Show info message if no customer found
        if (data.message === 'No Stripe customer found') {
          console.log('No Stripe customer found for user');
        }
      } else {
        console.error('Billing API error - Status:', res.status, 'Data:', data);
        toast.error(data.error || `Failed to fetch billing data (${res.status})`);
      }
    } catch (e) {
      console.error('Billing fetch error:', e);
      toast.error('Failed to fetch billing data');
    }
  }, [user?.id]);



  const triggerCancelDialog = () => {
    // Dispatch custom event to trigger cancel dialog in main dialog
    window.dispatchEvent(new CustomEvent('settings:showCancelDialog', {
      detail: { subscriptionId, userId: user?.id }
    }));
  };

  useEffect(() => { if (user?.id) fetchBillingData(); }, [user?.id, fetchBillingData]);

  // Listen for billing refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchBillingData();
      refreshSubscriptionStatus();
    };
    window.addEventListener('billing:refresh', handleRefresh);
    return () => window.removeEventListener('billing:refresh', handleRefresh);
  }, [fetchBillingData, refreshSubscriptionStatus]);

  if (!user) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Billing & Subscription</h2>
          <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
        </div>
        <Alert>
          <OutlineWarning />
          <AlertDescription>Please log in to view your billing information.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* === Current Subscription (no bg, no shadow) === */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Current Subscription</h3>
        </div>
        <div className="space-y-2 [&>*>span]:text-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-sm">
              <OutlineLoading className="animate-spin" size={20} />
              <span>Loading subscription status…</span>
            </div>
          ) : error ? (
            <Alert>
              <OutlineWarning size={20} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* rows */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium">Status</span>
                </div>
                {subscriptionStatusChip(subscriptionStatus, billingData?.currentSubscription?.cancel_at_period_end || false)}
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Plan</span>
                <span className="text-muted-foreground">{plan || 'No active plan'}</span>
              </div>
              {nextBillingDate && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium">Next Billing</span>
                  <span className="text-muted-foreground">{new Date(nextBillingDate).toLocaleDateString()}</span>
                </div>
              )}
              {billingData?.currentSubscription?.cancel_at_period_end && billingData?.currentSubscription?.current_period_end && (
                <>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="font-medium">Cancellation</span>
                    <span className="text-orange-600 font-medium">
                      Ends {new Date(billingData.currentSubscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                  {/* {billingData.currentSubscription.canceled_at && (
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <OutlineCalendar className="text-gray-500" />
                        <span className="font-medium">Canceled On</span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(billingData.currentSubscription.canceled_at).toLocaleDateString()}
                      </span>
                    </div>
                  )} */}
                  {/* {(billingData.currentSubscription).cancellation_reason && (
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <OutlineWarning className="text-gray-500" />
                        <span className="font-medium">Reason</span>
                      </div>
                      <span className="text-muted-foreground capitalize">
                        {(billingData.currentSubscription).cancellation_reason.replace('_', ' ')}
                      </span>
                    </div>
                  )} */}
                </>
              )}
              {customerId && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium">Customer ID</span>
                  <span className="text-muted-foreground font-mono text-xs">{customerId}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {isPremium && subscriptionId && (
                  <Button
                    onClick={triggerCancelDialog}
                    variant="destructive"
                    size="sm"
                    className="inline-flex items-center"
                    disabled={billingData?.currentSubscription?.cancel_at_period_end}
                  >
                    <OutlineTrash />
                    {billingData?.currentSubscription?.cancel_at_period_end ? 'Cancelled' : 'Cancel'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* === BILLING HISTORY (Discord-like expandable rows) === */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold">Billing History</h3>
        </div>

        {billingData?.billingHistory?.length ? (
          <div className="max-h-[320px] overflow-auto rounded-xl border bg-card">
            <Table
              className={[
                "w-full",
                "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-card",
                "[&_th]:py-1.5 [&_td]:py-1.5 [&_th]:px-3 [&_td]:px-3",
                "[&_th]:text-[11px] [&_td]:text-[13px] [&_td]:align-middle",
              ].join(" ")}
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="min-w-0">Description</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[90px] text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {billingData?.billingHistory.map((item) => {
                  const date = new Date(item.created).toLocaleDateString();
                  const isOpen = openRowId === item.id;
                  const daysAgo = Math.floor((Date.now() - new Date(item.created).getTime()) / 86400000);

                  return (
                    <React.Fragment key={item.id}>
                      {/* MAIN ROW */}
                      <TableRow
                        className="hover:bg-muted/40 cursor-pointer h-14"
                        onClick={() => setOpenRowId(prev => (prev === item.id ? null : item.id))}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        aria-controls={`row-details-${item.id}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setOpenRowId(prev => (prev === item.id ? null : item.id));
                          }
                        }}
                      >
                        <TableCell className="text-muted-foreground">{date}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* <IconCrown size={16} className="shrink-0" /> */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[300px] block">{item.description}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[400px]">
                                  <p className="text-sm">{item.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>

                        <TableCell>{statusChip(item.status)}</TableCell>

                        <TableCell className="text-right font-medium">
                          {money(item.amount, item.currency)}
                        </TableCell>
                      </TableRow>

                      {/* DETAILS ROW (maksymalnie zwarty) */}
                      {isOpen && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={4} className="p-0">
                            <div id={`row-details-${item.id}`} className="bg-muted/20">
                              <div className="space-y-4">
                                {/* Purchase Details Section */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-3 text-foreground">Purchase Details</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment ID</span>
                                        <span className="font-mono text-xs text-right max-w-[200px] truncate" title={item.id}>
                                          {item.id}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total</span>
                                        <span className="font-medium">{money(item.amount, item.currency)}</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <div>{statusChip(item.status)}</div>
                                      </div>
                                      {item.invoice_url && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Invoice</span>
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto px-0 text-blue-600 hover:text-blue-700"
                                            asChild
                                          >
                                            <Link href={item.invoice_url} target="_blank">
                                              Download
                                            </Link>
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Support Section */}
                                <div className="pt-3 border-t border-border/50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2 w-full">
                                      <span className="text-xs text-muted-foreground">PURCHASE DATE</span>
                                      <div className="flex justify-between w-full">
                                        <span className="text-sm">{daysAgo} days ago</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-3 text-xs"
                                          onClick={() => toast.info('this functionality is not available yet')}
                                        >
                                          Report a problem
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {billingData?.message === 'No Stripe customer found'
                ? 'No billing history available. Subscribe to Golden Carrot to see your billing information here.'
                : 'No billing history found.'
              }
            </p>
          </div>
        )}
      </section>
    </div >
  );
}
