"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { OutlineAI, OutlineCheck, OutlineStar } from "@/components/icons/Icons"

declare global {
  interface Window {
    Stripe: unknown
  }
}

/* ---------- Model ---------- */

type Provider = "paypal" | "kofi" | "patreon" | "github" | "stripe"
const PROVIDER_URL: Record<Provider, string> = {
  paypal: "https://paypal.me/rabbittale",
  kofi: "https://ko-fi.com/rabbittale",
  patreon: "https://patreon.com/rabbittale",
  github: "https://github.com/sponsors/rabbit-tale-co",
  stripe: "/api/create-payment-intent", // Added Stripe endpoint
}

type OneTimeTier = {
  name: string
  minUSD: number // minimum to qualify (single transaction)
  tagline: string
  perks: string[]
  discordRole?: string
  highlight?: boolean
}

const ONE_TIME_TIERS: OneTimeTier[] = [
  {
    name: "Donor",
    minUSD: 2,
    tagline: "Every little bit helps.",
    perks: ["“Donor” profile title", "Optional thank-you on the Supporters page"],
  },
  {
    name: "Supporter",
    minUSD: 5,
    tagline: "Unlock core supporter perks.",
    perks: [
      "“Supporter” title",
      "Enhanced search filters (accounts / media / tags)",
      "React in supporters Discord channels",
    ],
    discordRole: "Supporter",
  },
  {
    name: "Supporter+",
    minUSD: 15,
    tagline: "More room to post and be seen.",
    perks: [
      "All previous rewards",
      "Media boost: up to 10 images per post",
      "Longer captions (up to 1,000 chars)",
      "Eligible for “Featured Supporters” rotation",
    ],
    discordRole: "Supporter+",
  },
  {
    name: "Premium",
    minUSD: 25,
    tagline: "Customization & workflow.",
    perks: [
      "All previous rewards",
      "Profile themes / CSS presets",
      "Post scheduling & drafts",
      "Private collections (save posts for later)",
    ],
    discordRole: "Premium",
  },
  {
    name: "VIP",
    minUSD: 75,
    tagline: "For heavy creators.",
    perks: [
      "All previous rewards",
      "VIP badge next to username",
      "Creator analytics (impressions, reach, saves)",
      "Priority support lane for issues/requests",
    ],
    discordRole: "VIP",
  },
  {
    name: "VIP+",
    minUSD: 150,
    tagline: "Stand out across discovery.",
    perks: [
      "All previous rewards",
      "Discover accent/border (cosmetic)",
      "Vanity URL (e.g. /@you) when available",
      "Two extra pinned posts on profile",
    ],
    discordRole: "VIP+",
  },
  {
    name: "Sponsor",
    minUSD: 800,
    tagline: "Big boost for infra & milestones.",
    perks: [
      "All previous rewards",
      "Sponsor highlight placement on Discover (scheduled, opt-in)",
      "Early access to major feature betas",
      "Your artwork in a seasonal site banner* (opt-in, guidelines apply)",
    ],
    discordRole: "Sponsor",
    highlight: true,
  },
]

type Goal = { label: string; amountUSD: number; bullets: string[] }
const GOALS_2025: Goal[] = [
  {
    label: "Tier 1",
    amountUSD: 120_000,
    bullets: [
      "Moderation tools & report workflow (edit/close reports)",
      "Profile post collections/folders",
      "Contributor UX: more CSS allowed; curated theme presets",
      "QoL: content filter opt-outs; reorder gallery media; @mention autocomplete; “profile updated recently” indicator",
    ],
  },
  {
    label: "Tier 2",
    amountUSD: 160_000,
    bullets: [
      "Scalable image/video pipeline & CDN",
      "Discovery revamp (tags & topics)",
      "Faster search indexing + better ranking",
    ],
  },
  {
    label: "Tier 3",
    amountUSD: 200_000,
    bullets: [
      "Mobile polish & PWA offline cache",
      "Open API (read + limited write) with tokens",
      "Creator analytics (reach, saves, outbound clicks)",
    ],
  },
]

const STRETCH: Goal = {
  label: "Stretch 1",
  amountUSD: 350_000,
  bullets: ["Commission tools (beta) for creators", "Advanced theme editor", "Async rendering for heavy images/videos"],
}

/* ---------- Page ---------- */

export default function SupportPage() {
  const [amount, setAmount] = useState<string>("")
  const [isProcessingStripe, setIsProcessingStripe] = useState(false) // Added Stripe processing state
  const usd = useMemo(() => Number.parseFloat(amount) || 0, [amount])

  // find highest tier matched by current amount
  const matchedTier = useMemo(() => {
    const sorted = [...ONE_TIME_TIERS].sort((a, b) => b.minUSD - a.minUSD)
    return sorted.find((t) => usd >= t.minUSD) || null
  }, [usd])

  const handleStripePayment = async () => {
    if (usd < 2) return

    setIsProcessingStripe(true)
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(usd * 100),
          type: 'donation'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Stripe payment error:", error)
      alert(`Payment error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessingStripe(false)
    }
  }

  const quickAmounts = [5, 15, 25, 75, 150, 800]

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-16">
      {/* Header */}
      <section className="space-y-6 text-center">
        <div className="space-y-4">
          <Badge variant="outline" className="mx-auto">
            <OutlineAI className="size-4 mr-2" />
            Community-funded
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">Support RabbitHole</h1>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your contribution directly supports servers, image hosting, site assets, and ongoing development. Core
            features remain available to everyone.
          </p>
          <p className="text-sm text-muted-foreground">
            Current stage of this page is still WIP, tiers perks and goals can change on final release.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <ProviderButton provider="patreon" />
          <ProviderButton provider="github" />
          <ProviderButton provider="kofi" variant="outline" />
          <ProviderButton provider="paypal" variant="outline" />
        </div>
      </section>

      {/* Monthly */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Monthly Contributions</h2>
        </div>

        <Alert>
          <AlertTitle>Temporarily unavailable</AlertTitle>
          <AlertDescription>
            Monthly plans will return later. You can still support via Patreon or GitHub Sponsors pages, but benefits
            won&apos;t sync until monthly is re-enabled here.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          <ProviderButton provider="patreon" />
          <ProviderButton provider="github" />
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* One-time: amount selector + provider CTAs */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">One-time Contribution</h2>
          <p className="text-muted-foreground leading-relaxed">
            Pick a custom amount or use a quick amount. Rewards unlock when a single transaction meets a tier minimum.
          </p>
        </div>

        <div className="space-y-6 bg-muted/30 rounded-2xl p-8">
          <div className="space-y-4">
            <label htmlFor="amount" className="text-sm font-medium block">
              Amount (USD)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              {quickAmounts.map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={usd === v ? "default" : "outline"}
                  onClick={() => setAmount(String(v))}
                  className="min-w-16"
                >
                  ${v}
                </Button>
              ))}
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="Custom"
                type="number"
                className="w-32"
                min={0}
                max={10_000_000}
                value={amount}
                onChange={(e) => {
                  const value = e.target.value
                  if (
                    value === "" ||
                    (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 10_000_000)
                  ) {
                    setAmount(value)
                  }
                }}
              />
            </div>
          </div>

          {/* Matched tier badge */}
          <div className="text-sm">
            {usd > 0 ? (
              matchedTier ? (
                <div className="flex items-center gap-3">
                  <Badge className="h-6">{matchedTier.name}</Badge>
                  <span className="text-muted-foreground">
                    You currently qualify for <span className="font-medium">${matchedTier.minUSD}+</span>{" "}
                    {matchedTier.name}.
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Contribute <span className="font-medium">$2+</span> to unlock the{" "}
                  <span className="font-medium">Donor</span> tier.
                </span>
              )
            ) : (
              <span className="text-muted-foreground">Select an amount to see your tier.</span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleStripePayment} disabled={usd < 2 || isProcessingStripe} className="min-w-24">
                {isProcessingStripe ? "Processing..." : "Pay with Stripe"}
              </Button>
              <ProviderButton provider="paypal" variant="outline" />
              <ProviderButton provider="kofi" variant="outline" />
            </div>

            <p className="text-xs text-muted-foreground">
              Stripe provides secure card payments. Other providers redirect to their respective platforms.
            </p>
          </div>
        </div>
      </section>

      {/* One-time Tiers list */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Reward Tiers</h3>
          <p className="text-muted-foreground leading-relaxed">
            Cosmetic and quality-of-life rewards designed for a social media app. See FAQ for duration and details.
          </p>
        </div>

        <div className="space-y-1">
          {ONE_TIME_TIERS.map((tier, index) => (
            <div key={tier.name}>
              <TierRow tier={tier} active={usd >= tier.minUSD && usd > 0} />
              {index < ONE_TIME_TIERS.length - 1 && <div className="h-px bg-border mx-8" />}
            </div>
          ))}
        </div>

        {/* Bonus rule */}
        <div className="bg-muted/30 rounded-2xl p-6 space-y-2">
          <h4 className="font-semibold">Bonus Rename Credits</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every <span className="font-medium">$2</span> in a single transaction grants{" "}
            <span className="font-medium">+1 username change</span> (max 12 stored). Manage in{" "}
            <span className="font-medium">Settings → Security → Change Username</span>.
          </p>
        </div>
      </section>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Goals */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">2025 Goals</h3>
          <p className="text-muted-foreground leading-relaxed">
            These communicate what funded work we can deliver. We&apos;ll keep you updated as goals are reached and items
            ship.
          </p>
        </div>

        <div className="space-y-1">
          {GOALS_2025.map((g, index) => (
            <div key={g.label}>
              <div className="py-8 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="text-xl font-semibold">{g.label}</h4>
                  <Badge variant="secondary" className="text-sm">
                    ${g.amountUSD.toLocaleString()}
                  </Badge>
                </div>
                <ul className="space-y-3 text-sm">
                  {g.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <OutlineCheck className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {index < GOALS_2025.length - 1 && <div className="h-px bg-border mx-6" />}
            </div>
          ))}

          {/* Stretch */}
          <div className="bg-primary/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-xl font-semibold">Stretch Goal</h4>
              <Badge className="text-sm">${STRETCH.amountUSD.toLocaleString()}</Badge>
            </div>
            <ul className="space-y-3 text-sm">
              {STRETCH.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <OutlineCheck className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <h3 className="text-2xl font-semibold">Contribution FAQ</h3>
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="rewards" className="border rounded-xl px-6">
            <AccordionTrigger className="text-sm font-medium">When do I get my rewards?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Rewards apply once your transaction is verified (typically within 24h). Discord roles are assigned after
              you link your account or DM proof on the server.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="duration" className="border rounded-xl px-6">
            <AccordionTrigger className="text-sm font-medium">How long do rewards last?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              One-time tier rewards are persistent unless marked time-limited. Monthly rewards resume when monthly plans
              return and your status is synced.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="installments" className="border rounded-xl px-6">
            <AccordionTrigger className="text-sm font-medium">Can I pay in small amounts over time?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Yes, but tier unlocks are based on the amount in a single transaction. Bonus rename credits also count per
              single transaction.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="featured" className="border rounded-xl px-6">
            <AccordionTrigger className="text-sm font-medium">Who is featured on the front page?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Supporter+ and above are eligible for &quot;Featured Supporters&quot; (opt-in). Rotation keeps it fair and fresh.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cancel" className="border rounded-xl px-6">
            <AccordionTrigger className="text-sm font-medium">
              How do I cancel a recurring contribution?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              Cancel on the platform you used (Patreon or GitHub Sponsors). We&apos;ll re-sync statuses automatically once
              monthly returns.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Terms */}
      <section className="bg-muted/30 rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Terms &amp; Conditions</h3>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li>
            If you have an issue with payment or rewards, please contact <span className="font-medium">@admin</span>.
          </li>
          <li>
            All contributors must follow the rules and ToS. Administrative actions don&apos;t qualify for refunds or benefit
            extensions.
          </li>
          <li>* Banner artwork must meet content guidelines; staff may request a different image if necessary.</li>
        </ul>
      </section>
    </div>
  )
}

/* ---------- UI bits ---------- */

function ProviderButton({
  provider,
  variant = "default",
}: {
  provider: Provider
  variant?: "default" | "outline"
}) {
  const label =
    provider === "paypal"
      ? "PayPal"
      : provider === "kofi"
        ? "Ko-fi"
        : provider === "patreon"
          ? "Patreon"
          : provider === "stripe"
            ? "Stripe"
            : "GitHub Sponsors"

  if (provider === "stripe") {
    return null // Stripe button is handled separately in the component
  }

  return (
    <Button asChild size="sm" variant={variant}>
      <Link href={PROVIDER_URL[provider]} target="_blank" rel="noreferrer noopener">
        {label}
      </Link>
    </Button>
  )
}

function TierRow({ tier, active }: { tier: OneTimeTier; active: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-6 p-8 sm:grid-cols-[1fr_auto] items-start transition-colors",
        tier.highlight && "bg-primary/5 rounded-2xl",
        active && "bg-primary/10 rounded-2xl",
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-semibold">{tier.name}</h4>
          {tier.highlight && (
            <Badge className="gap-1.5">
              <OutlineStar className="size-3.5" />
              Highlight
            </Badge>
          )}
          {active && <Badge variant="secondary">Matched</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold">${tier.minUSD}+</span> • {tier.tagline}
        </div>
        <ul className="space-y-2 text-sm">
          {tier.perks.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <OutlineCheck className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
          {tier.discordRole && (
            <li className="flex items-start gap-3">
              <OutlineCheck className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="leading-relaxed">
                Discord role: <span className="font-medium">{tier.discordRole}</span>
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="text-right space-y-3">
        <div>
          <div className="text-sm text-muted-foreground">One-time</div>
          <div className="text-2xl font-bold">${tier.minUSD}+</div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <ProviderButton provider="paypal" />
          <ProviderButton provider="kofi" variant="outline" />
        </div>
      </div>
    </div>
  )
}
