'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Carrot, Check, Minus, Shield } from 'lucide-react';

const USD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const MONTHLY_PRICE = 12.99;
const YEARLY_PRICE = 89.99; // your chosen .99 annual
const SAVINGS_PCT = Math.round((1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100); // ≈ 42%

export default function GoldenCarrotPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'monthly' | 'annual'>('monthly');

  const yearlyPerMonth = useMemo(() => YEARLY_PRICE / 12, []);
  const userEmail = (user as { email?: string; user_metadata?: { email?: string } } | null)?.email ?? (user as { user_metadata?: { email?: string } } | null)?.user_metadata?.email;

  return (
    <div className="mx-auto max-w-5xl py-10 space-y-10">
      {/* Header */}
      <section className="text-center space-y-3">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <Carrot className="h-3.5 w-3.5" />
          Golden Carrot — Premium
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Do more with Golden Carrot</h1>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground prose prose-sm sm:prose-base">
          Animated avatar & cover, higher upload limits, longer captions, more media per post, and folders to keep your art organized.
          Stripe handles billing; you can cancel anytime.
        </p>
      </section>

      {/* Pricing + Checkout (tabs) */}
      <section className="rounded-xl ring-1 ring-border p-4 sm:p-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'monthly' | 'annual')}>
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-2 w-[320px]">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual" className="relative">
                Annual
                <Badge className="absolute -right-6 rotate-12 -top-4">{`-${SAVINGS_PCT}%`}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] items-start">
              <PerksBlock />
              <PriceCard title="Monthly" price={USD(MONTHLY_PRICE)} sub="Billed every month via Stripe">
                <StripeCheckoutForm
                  plan="monthly"
                  userId={user?.id}
                  email={userEmail}
                />
              </PriceCard>
            </div>
          </TabsContent>

          <TabsContent value="annual" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] items-start">
              <PerksBlock />
              <PriceCard
                title="Annual"
                price={USD(YEARLY_PRICE)}
                sub={`${USD(yearlyPerMonth)} / mo · billed yearly`}
                highlight
                badgeText={`Save ${SAVINGS_PCT}%`}
              >
                <StripeCheckoutForm
                  plan="yearly"
                  userId={user?.id}
                  email={userEmail}
                />
              </PriceCard>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Compare table */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Compare plans</h2>
        <div className="rounded-xl ring-1 ring-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Feature</TableHead>
                <TableHead className="text-right">Free</TableHead>
                <TableHead className="text-right">Golden Carrot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Row label="Animated avatar & cover" free={<Minus className="inline h-4 w-4 text-muted-foreground" />} pro={<Check className="inline h-4 w-4" />} />
              <Row label="Max file size" free="15 MB" pro="50 MB" />
              <Row label="Caption length" free="300 chars" pro="1,000 chars" />
              <Row label="Media per post" free="5" pro="10" />
              <Row label="Profile folders / collections" free={<Minus className="inline h-4 w-4 text-muted-foreground" />} pro={<Check className="inline h-4 w-4" />} />
              <Row label="Carrot badge next to username" free={<Minus className="inline h-4 w-4 text-muted-foreground" />} pro={<Check className="inline h-4 w-4" />} />
              <Row
                label="Profile music (up to 30s) — soon"
                free={<Minus className="inline h-4 w-4 text-muted-foreground" />}
                pro={<Badge variant="secondary" className="text-[11px]">Soon</Badge>}
              />
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground prose">
          Profile music will include loudness normalization. Abuse (excessive volume, “earrape”, NSFW audio) can result in removal of access per ToS.
        </p>
      </section>

      <Separator />

      {/* FAQ / Terms teaser */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-border p-4 sm:p-5">
          <h3 className="text-base font-semibold mb-2">FAQ</h3>
          <Accordion type="single" collapsible>
            <AccordionItem value="activate">
              <AccordionTrigger className="text-sm">When do perks activate?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                After Stripe confirms payment (usually within minutes). Annual lasts 12 months from purchase.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="limits">
              <AccordionTrigger className="text-sm">What are the exact limits?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Golden Carrot targets 50 MB per file, 1,000 characters per caption, and up to 10 media per post. These may evolve with infrastructure; this page will be updated accordingly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="manage">
              <AccordionTrigger className="text-sm">How can I manage or cancel?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Use the Stripe customer portal from your receipt or profile billing page. Monthly renews each month; annual ends automatically unless renewed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="rounded-xl ring-1 ring-border p-4 sm:p-5">
          <h3 className="text-base font-semibold mb-2">Security &amp; Billing</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5 prose">
            <li>Payments are processed securely by Stripe <Shield className="inline ml-1 h-4 w-4 align-text-bottom" />.</li>
            <li>You can request a copy or deletion of your data—see our <a className="underline underline-offset-4" href="/legal/privacy">Privacy Policy</a>.</li>
            <li>By subscribing you agree to our <a className="underline underline-offset-4" href="/legal/terms">Terms of Service</a>.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

/* --- UI bits --- */

function PerksBlock() {
  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        What you get <Badge className="h-5 px-2"><Carrot className="h-3.5 w-3.5" /></Badge>
      </h2>
      <ul className="mt-3 space-y-1.5 text-sm prose">
        <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4" />Animated avatar & cover (GIF/WebP)</li>
        <li className="flex gap-2">
          <Check className="mt-0.5 h-4 w-4" />
          Higher limits: bigger file size, longer captions, more media per post
          <span className="text-muted-foreground">{' '}— e.g. 50 MB, 1,000 chars, 10 media</span>
        </li>
        <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4" />Carrot badge next to your username</li>
        <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4" />Profile folders/collections for organization</li>
        <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4" />Soon: 30-second profile music (subject to ToS & moderation)</li>
      </ul>
    </div>
  );
}

function PriceCard({
  title,
  price,
  sub,
  children,
  highlight,
  badgeText,
}: {
  title: string;
  price: string;
  sub: string;
  children: React.ReactNode;
  highlight?: boolean;
  badgeText?: string;
}) {
  return (
    <div className={cn('w-full sm:w-[320px] rounded-xl ring-1 ring-border p-5 space-y-2', highlight && 'bg-primary/5')}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {badgeText && <Badge>{badgeText}</Badge>}
      </div>
      <div className="text-3xl font-semibold">{price}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
      <div className="pt-2">{children}</div>
      <p className="text-[11px] text-muted-foreground">Secure checkout with Stripe.</p>
    </div>
  );
}

function StripeCheckoutForm({ plan, userId, email }: { plan: 'monthly' | 'yearly'; userId?: string; email?: string }) {
  return (
    <form action="/api/golden-carrot/checkout" method="POST" className="flex flex-col gap-2">
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="userId" value={userId ?? ''} />
      <input type="hidden" name="email" value={email ?? ''} />
      <Button type="submit" className="w-full">Continue with Stripe</Button>
    </form>
  );
}

function Row({ label, free, pro }: { label: string; free: React.ReactNode; pro: React.ReactNode }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell className="text-right text-muted-foreground">{free}</TableCell>
      <TableCell className="text-right">{pro}</TableCell>
    </TableRow>
  );
}
