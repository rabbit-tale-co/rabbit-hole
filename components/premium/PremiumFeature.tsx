'use client';

import { ReactNode } from 'react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SolidCarrot } from '@/components/icons/Icons';
import Link from 'next/link';

interface PremiumFeatureProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredPlan?: string;
  showUpgrade?: boolean;
  className?: string;
}

export function PremiumFeature({
  children,
  fallback,
  requiredPlan,
  showUpgrade = true,
  className
}: PremiumFeatureProps) {
  const { isPremium, plan, loading, subscriptionStatus } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-muted rounded-lg h-32 flex items-center justify-center">
          <span className="text-muted-foreground">Loading premium status...</span>
        </div>
      </div>
    );
  }

  // Check if user has required plan
  const hasRequiredPlan = !requiredPlan || plan === requiredPlan;
  const hasAccess = isPremium && hasRequiredPlan;

  if (!hasAccess) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    if (!showUpgrade) {
      return null;
    }

    return (
      <Card className={className}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <SolidCarrot className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Premium Feature</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {!isPremium
              ? "This feature requires an active Golden Carrot subscription."
              : `This feature requires the ${requiredPlan} plan.`
            }
          </p>

          {subscriptionStatus === 'inactive' && (
            <Badge variant="outline" className="text-xs">
              Subscription Inactive
            </Badge>
          )}

          {subscriptionStatus === 'past_due' && (
            <Badge variant="destructive" className="text-xs">
              Payment Required
            </Badge>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/golden-carrot">
                {!isPremium ? 'Get Golden Carrot' : 'Upgrade Plan'}
              </Link>
            </Button>

            {isPremium && subscriptionStatus === 'past_due' && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings/billing">
                  Update Payment Method
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return <div className={className}>{children}</div>;
}

// Convenience component for premium content
export function PremiumContent({
  children,
  requiredPlan,
  className
}: {
  children: ReactNode;
  requiredPlan?: string;
  className?: string;
}) {
  return (
    <PremiumFeature
      requiredPlan={requiredPlan}
      showUpgrade={false}
      className={className}
    >
      {children}
    </PremiumFeature>
  );
}

// Component to show premium badge
export function PremiumBadge({
  plan,
  className
}: {
  plan?: string;
  className?: string;
}) {
  const { isPremium, plan: userPlan } = useSubscriptionStatus();

  if (!isPremium) return null;

  return (
    <Badge variant="default" className={className}>
      <SolidCarrot className="h-3 w-3 mr-1" />
      {plan || userPlan || 'Premium'}
    </Badge>
  );
}
