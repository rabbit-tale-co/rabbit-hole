'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

/* ---------- Model ---------- */

type Provider = 'paypal' | 'kofi' | 'patreon' | 'github';
const PROVIDER_URL: Record<Provider, string> = {
  paypal: 'https://paypal.me/rabbittale',
  kofi: 'https://ko-fi.com/rabbittale',
  patreon: 'https://patreon.com/rabbittale',
  github: 'https://github.com/sponsors/rabbit-tale-co',
};

type OneTimeTier = {
  name: string;
  minUSD: number;            // minimum to qualify (single transaction)
  tagline: string;
  perks: string[];
  discordRole?: string;
  highlight?: boolean;
};

const ONE_TIME_TIERS: OneTimeTier[] = [
  {
    name: 'Donor',
    minUSD: 2,
    tagline: 'Every little bit helps.',
    perks: [
      '“Donor” profile title',
      'Optional thank-you on the Supporters page',
    ],
  },
  {
    name: 'Supporter',
    minUSD: 5,
    tagline: 'Unlock core supporter perks.',
    perks: [
      '“Supporter” title',
      'Enhanced search filters (accounts / media / tags)',
      'React in supporters Discord channels',
    ],
    discordRole: 'Supporter',
  },
  {
    name: 'Supporter+',
    minUSD: 15,
    tagline: 'More room to post and be seen.',
    perks: [
      'All previous rewards',
      'Media boost: up to 10 images per post',
      'Longer captions (up to 1,000 chars)',
      'Eligible for “Featured Supporters” rotation',
    ],
    discordRole: 'Supporter+',
  },
  {
    name: 'Premium',
    minUSD: 25,
    tagline: 'Customization & workflow.',
    perks: [
      'All previous rewards',
      'Profile themes / CSS presets',
      'Post scheduling & drafts',
      'Private collections (save posts for later)',
    ],
    discordRole: 'Premium',
  },
  {
    name: 'VIP',
    minUSD: 75,
    tagline: 'For heavy creators.',
    perks: [
      'All previous rewards',
      'VIP badge next to username',
      'Creator analytics (impressions, reach, saves)',
      'Priority support lane for issues/requests',
    ],
    discordRole: 'VIP',
  },
  {
    name: 'VIP+',
    minUSD: 150,
    tagline: 'Stand out across discovery.',
    perks: [
      'All previous rewards',
      'Discover accent/border (cosmetic)',
      'Vanity URL (e.g. /@you) when available',
      'Two extra pinned posts on profile',
    ],
    discordRole: 'VIP+',
  },
  {
    name: 'Sponsor',
    minUSD: 800,
    tagline: 'Big boost for infra & milestones.',
    perks: [
      'All previous rewards',
      'Sponsor highlight placement on Discover (scheduled, opt-in)',
      'Early access to major feature betas',
      'Your artwork in a seasonal site banner* (opt-in, guidelines apply)',
    ],
    discordRole: 'Sponsor',
    highlight: true,
  },
];

type Goal = { label: string; amountUSD: number; bullets: string[] };
const GOALS_2025: Goal[] = [
  {
    label: 'Tier 1',
    amountUSD: 120_000,
    bullets: [
      'Moderation tools & report workflow (edit/close reports)',
      'Profile post collections/folders',
      'Contributor UX: more CSS allowed; curated theme presets',
      'QoL: content filter opt-outs; reorder gallery media; @mention autocomplete; “profile updated recently” indicator',
    ],
  },
  {
    label: 'Tier 2',
    amountUSD: 160_000,
    bullets: [
      'Scalable image/video pipeline & CDN',
      'Discovery revamp (tags & topics)',
      'Faster search indexing + better ranking',
    ],
  },
  {
    label: 'Tier 3',
    amountUSD: 200_000,
    bullets: [
      'Mobile polish & PWA offline cache',
      'Open API (read + limited write) with tokens',
      'Creator analytics (reach, saves, outbound clicks)',
    ],
  },
];

const STRETCH: Goal = {
  label: 'Stretch 1',
  amountUSD: 350_000,
  bullets: [
    'Commission tools (beta) for creators',
    'Advanced theme editor',
    'Async rendering for heavy images/videos',
  ],
};

/* ---------- Page ---------- */

export default function SupportPage() {
  const [amount, setAmount] = useState<string>('');
  const usd = useMemo(() => Number.parseFloat(amount) || 0, [amount]);

  // find highest tier matched by current amount
  const matchedTier = useMemo(() => {
    const sorted = [...ONE_TIME_TIERS].sort((a, b) => b.minUSD - a.minUSD);
    return sorted.find((t) => usd >= t.minUSD) || null;
  }, [usd]);

  const quickAmounts = [5, 15, 25, 75, 150, 800];

  return (
    <div className="mx-auto max-w-5xl py-6 sm:py-10 space-y-10">
      {/* Header */}
      <section className="space-y-3 text-center">
        <Badge variant="outline" className="mx-auto px-3 py-1 text-xs">
          <Sparkles className="size-3.5" />
          Community-funded
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Support RabbitHole</h1>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Your contribution directly supports servers, image hosting, site assets, and ongoing development.
          Core features remain available to everyone.
        </p>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Current stage of this page is still WIP, tiers perks and goals can change on final release.
        </p>

        {/* Global quick CTAs */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <ProviderButton provider="patreon" />
          <ProviderButton provider="github" />
          <ProviderButton provider="kofi" variant="outline" />
          <ProviderButton provider="paypal" variant="outline" />
        </div>
      </section>

      {/* Monthly */}
      <section>
        <h2 className="text-base font-semibold">Monthly Contributions</h2>
        <Alert className="mt-3">
          <AlertTitle>Temporarily unavailable</AlertTitle>
          <AlertDescription>
            Monthly plans will return later. You can still support via Patreon or GitHub Sponsors pages,
            but benefits won’t sync until monthly is re-enabled here.
          </AlertDescription>
        </Alert>
        <div className="mt-3 flex flex-wrap gap-2">
          <ProviderButton provider="patreon" />
          <ProviderButton provider="github" />
        </div>
      </section>

      <Separator />

      {/* One-time: amount selector + provider CTAs */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">One-time Contribution</h2>
        <p className="text-sm text-muted-foreground">
          Pick a custom amount or use a quick amount. Rewards unlock when a single transaction meets a tier minimum.
          If PayPal in your country is unavailable, Ko-fi is a good alternative.
        </p>

        <div className="rounded-xl ring-1 ring-border p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (USD)
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:ml-4">
              {quickAmounts.map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={usd === v ? 'default' : 'outline'}
                  onClick={() => setAmount(String(v))}
                >
                  ${v}
                </Button>
              ))}
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="Custom"
                type="number"
                className="w-32 h-8"
                min={0}
                max={10_000_000}
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 10_000_000)) {
                    setAmount(value);
                  }
                }}
              />
            </div>
          </div>

          {/* Matched tier badge */}
          <div className="text-sm">
            {usd > 0 ? (
              matchedTier ? (
                <span className="inline-flex items-center gap-2">
                  <Badge className="h-5">{matchedTier.name}</Badge>
                  <span className="text-muted-foreground">
                    You currently qualify for <span className="font-medium">${matchedTier.minUSD}+</span> {matchedTier.name}.
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Contribute <span className="font-medium">$2+</span> to unlock the <span className="font-medium">Donor</span> tier.
                </span>
              )
            ) : (
              <span className="text-muted-foreground">Select an amount to see your tier.</span>
            )}
          </div>

          {/* Provider CTAs for one-time */}
          <div className="flex flex-wrap gap-2">
            <ProviderButton provider="paypal" />
            <ProviderButton provider="kofi" variant="outline" />
          </div>

          <p className="text-xs text-muted-foreground">
            Amount entry is currently on the provider page (we’ll add pre-filled links where possible).
          </p>
        </div>
      </section>

      {/* One-time Tiers list (rows, no cards) */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Reward Tiers (One-time)</h3>
        <p className="text-sm text-muted-foreground">
          Cosmetic and quality-of-life rewards designed for a social media app. See FAQ for duration and details.
        </p>

        <div className="rounded-xl ring-1 ring-border divide-y">
          {ONE_TIME_TIERS.map((tier) => (
            <TierRow
              key={tier.name}
              tier={tier}
              active={usd >= tier.minUSD && usd > 0}
            />
          ))}
        </div>

        {/* Bonus rule */}
        <div className="rounded-xl ring-1 ring-border p-4 sm:p-5">
          <h4 className="text-sm font-semibold">Bonus Rename Credits</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Every <span className="font-medium">$2</span> in a single transaction grants{' '}
            <span className="font-medium">+1 username change</span> (max 12 stored).
            Manage in <span className="font-medium">Settings → Security → Change Username</span>.
          </p>
        </div>
      </section>

      <Separator />

      {/* Goals */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">2025 Goals (Projected)</h3>
        <p className="text-sm text-muted-foreground">
          These communicate what funded work we can deliver. We’ll keep you updated as goals are reached and items ship.
        </p>

        <div className="rounded-xl ring-1 ring-border divide-y">
          {GOALS_2025.map((g) => (
            <div key={g.label} className="p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold">{g.label}</h4>
                  <Badge variant="secondary">${g.amountUSD.toLocaleString()}</Badge>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {g.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-foreground/80" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Stretch */}
          <div className="p-4 sm:p-5 bg-primary/5">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold">Stretch Goal</h4>
              <Badge>${STRETCH.amountUSD.toLocaleString()}</Badge>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {STRETCH.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-foreground/80" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">Contribution FAQ</h3>
        <Accordion type="single" collapsible className="rounded-xl ring-1 ring-border">
          <AccordionItem value="rewards" className="px-4">
            <AccordionTrigger className="text-sm">When do I get my rewards?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Rewards apply once your transaction is verified (typically within 24h). Discord roles are assigned
              after you link your account or DM proof on the server.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="duration" className="px-4">
            <AccordionTrigger className="text-sm">How long do rewards last?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              One-time tier rewards are persistent unless marked time-limited. Monthly rewards resume when
              monthly plans return and your status is synced.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="installments" className="px-4">
            <AccordionTrigger className="text-sm">Can I pay in small amounts over time?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Yes, but tier unlocks are based on the amount in a single transaction. Bonus rename credits also
              count per single transaction.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="featured" className="px-4">
            <AccordionTrigger className="text-sm">Who is featured on the front page?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Supporter+ and above are eligible for “Featured Supporters” (opt-in). Rotation keeps it fair and fresh.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancel" className="px-4">
            <AccordionTrigger className="text-sm">How do I cancel a recurring contribution?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              Cancel on the platform you used (Patreon or GitHub Sponsors). We’ll re-sync statuses automatically
              once monthly returns.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Terms */}
      <section className="rounded-xl ring-1 ring-border p-4 sm:p-5">
        <h3 className="text-base font-semibold">Terms &amp; Conditions</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
          <li>If you have an issue with payment or rewards, please contact <span className="font-medium">@admin</span>.</li>
          <li>All contributors must follow the rules and ToS. Administrative actions don’t qualify for refunds or benefit extensions.</li>
          <li>* Banner artwork must meet content guidelines; staff may request a different image if necessary.</li>
        </ul>
      </section>
    </div>
  );
}

/* ---------- UI bits ---------- */

function ProviderButton({
  provider,
  variant = 'default',
}: {
  provider: Provider;
  variant?: 'default' | 'outline';
}) {
  const label =
    provider === 'paypal'
      ? 'PayPal'
      : provider === 'kofi'
        ? 'Ko-fi'
        : provider === 'patreon'
          ? 'Patreon'
          : 'GitHub Sponsors';

  return (
    <Button asChild size="sm" variant={variant}>
      <Link href={PROVIDER_URL[provider]} target="_blank" rel="noreferrer noopener">
        {label}
      </Link>
    </Button>
  );
}

function TierRow({ tier, active }: { tier: OneTimeTier; active: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-3 p-4 sm:p-5 sm:grid-cols-[1fr_auto] items-start transition-colors',
        tier.highlight && 'bg-primary/5',
        active && 'ring-inset bg-primary/5/40'
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold">{tier.name}</h4>
          {tier.highlight && (
            <Badge className="gap-1">
              <Star className="size-3.5" />
              Highlight
            </Badge>
          )}
          {active && <Badge variant="secondary">Matched</Badge>}
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">
          <span className="font-semibold">${tier.minUSD}+</span> • {tier.tagline}
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {tier.perks.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-foreground/80" />
              <span>{p}</span>
            </li>
          ))}
          {tier.discordRole && (
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-foreground/80" />
              <span>
                Discord role:{' '}
                <span className="font-medium">{tier.discordRole}</span>
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="sm:text-right">
        <div className="text-sm text-muted-foreground">One-time</div>
        <div className="text-xl font-semibold">${tier.minUSD}+</div>
        <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
          {/* One-time providers */}
          <ProviderButton provider="paypal" />
          <ProviderButton provider="kofi" variant="outline" />
        </div>
      </div>
    </div>
  );
}
