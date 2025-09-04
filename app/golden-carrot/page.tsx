"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, Suspense } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { OutlineCheck, OutlineMinus, OutlineShield, SolidCarrot } from "@/components/icons/Icons"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import NumberFlow from "@number-flow/react"
import { TypographyH1 } from "@/components/ui/typography/h1"
import { TypographyP } from "@/components/ui/typography/p"


const USD = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

const MONTHLY_PRICE = 12.99
const YEARLY_PRICE = 89.99
// const DAY_PRICE = 0.99
const SAVINGS_PCT = Math.round((1 - YEARLY_PRICE / (MONTHLY_PRICE * 12)) * 100)


interface SubscriptionStatus {
  isActive: boolean
  plan?: "monthly" | "yearly" | "day"
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  customerId?: string
}


function GoldenCarrotContent() {
  const { user } = useAuth()
  const [tab, setTab] = useState<"monthly" | "annual" | "day">("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ isActive: false })
  const searchParams = useSearchParams()

  const yearlyPerMonth = useMemo(() => YEARLY_PRICE / 12, [])
  const userEmail =
    (user as { email?: string; user_metadata?: { email?: string } } | null)?.email ??
    (user as { user_metadata?: { email?: string } } | null)?.user_metadata?.email

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return

    try {
      // console.log('🔍 Fetching subscription status for user:', user.id)
      const response = await fetch(`/api/user/subscription-status?userId=${user.id}`)
      // console.log('📡 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        // console.log('📋 Subscription status data:', data)

        // Map API response to frontend format
        const mappedStatus: SubscriptionStatus = {
          isActive: data.isPremium || false,
          plan: (data.plan === 'day' ? 'day' : data.plan === 'monthly' ? 'monthly' : data.plan === 'yearly' ? 'yearly' : undefined) as "day" | "monthly" | "yearly" | undefined,
          currentPeriodEnd: data.nextBillingDate,
          cancelAtPeriodEnd: false,
          customerId: data.customerId
        }

        // console.log('🔄 Mapped subscription status:', mappedStatus)
        setSubscriptionStatus(mappedStatus)
      } else {
        console.error('❌ Failed to fetch subscription status:', response.status)
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error)
    }
  }, [user?.id])

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [user?.id, fetchSubscriptionStatus])

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")
    const sessionId = searchParams.get("session_id")

    if (success && sessionId) {
      toast.success("Your subscription is now active.")

      const syncPremiumStatus = async () => {
        try {
          const response = await fetch("/api/user/subscription-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })

          if (response.ok) {
            // console.log("Premium status synced successfully")
            fetchSubscriptionStatus()
          }
        } catch (error) {
          console.error("Failed to sync premium status:", error)
        }
      }

      setTimeout(syncPremiumStatus, 2000)
    } else if (canceled) {
      toast.error("Payment was canceled. You can try again anytime.")
    }
  }, [searchParams, fetchSubscriptionStatus])

  return (
    <div className="mx-auto max-w-4xl py-16 px-6 flex flex-col items-center">
      <section className="text-center space-y-6 mb-20 flex flex-col items-center">
        <SolidCarrot size={48} className="text-orange-500" />
        <div className="space-y-4 flex flex-col items-center">
          <TypographyH1>Claim the Golden Carrot</TypographyH1>
          <TypographyP className="mx-auto max-w-2xl text-lg text-muted-foreground text-balance leading-relaxed">
            Give your burrow a glow-up: animated avatar & cover, bigger uploads, longer tales, more media per post,
            and tidy folders to keep your art stash neat.
          </TypographyP>
        </div>
      </section>


      {/* {subscriptionStatus.isActive && !loadingSubscription && (
        <section className="mb-12">
          <CurrentSubscriptionCard subscriptionStatus={subscriptionStatus} onStatusUpdate={fetchSubscriptionStatus} userId={user?.id} />
        </section>
      )} */}

      <section className="mb-20">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "monthly" | "annual" | "day")}>
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-2 w-[480px]">
              <TabsTrigger className="h-10" value="monthly">Monthly</TabsTrigger>
              <TabsTrigger className="h-10 relative" value="annual">
                Annual
                <Badge className="absolute -right-6 rotate-12 -top-4 bg-green-100 text-green-800 border-green-200">{`-${SAVINGS_PCT}%`}</Badge>
              </TabsTrigger>
              {/* <TabsTrigger value="day" className="relative">
                Debug
                <Badge className="absolute -right-6 rotate-12 -top-4 bg-red-100 text-red-800 border-red-200">
                  $0.99
                </Badge>
              </TabsTrigger> */}
            </TabsList>
          </div>

          <TabsContent value="monthly" className="space-y-12">
            <PriceSection
              title="Monthly"
              price={USD(MONTHLY_PRICE)}
              sub="Billed every month"
              plan="monthly"
              userId={user?.id}
              email={userEmail}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              subscriptionStatus={subscriptionStatus}
            />
            <PerksBlock />
          </TabsContent>

          <TabsContent value="annual" className="space-y-12">
            <PriceSection
              title="Annual"
              price={USD(YEARLY_PRICE)}
              sub={`${USD(yearlyPerMonth)} / mo · billed yearly`}
              badgeText={`Save ${SAVINGS_PCT}%`}
              plan="yearly"
              userId={user?.id}
              email={userEmail}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              subscriptionStatus={subscriptionStatus}
            />
            <PerksBlock />
          </TabsContent>

          {/* <TabsContent value="day" className="space-y-12">
            <PriceSection
              title="Debug Test"
              price={USD(DAY_PRICE)}
              sub="Test premium activation - 1 month"
              badgeText="DEBUG"
              plan="day"
              userId={user?.id}
              email={userEmail}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              subscriptionStatus={subscriptionStatus}
            />
            <PerksBlock />
          </TabsContent> */}
        </Tabs>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-8 text-center">Compare plans</h2>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2">
                <TableHead className="w-1/2 text-base font-semibold">Feature</TableHead>
                <TableHead className="text-right text-base font-semibold">Free</TableHead>
                <TableHead className="text-right text-base font-semibold">Golden Carrot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Row
                label="Animated avatar & cover"
                free={<OutlineMinus className="inline h-4 w-4 text-muted-foreground" />}
                pro={<OutlineCheck className="inline h-4 w-4 text-green-600" />}
              />
              <Row label="Max file size" free="15 MB" pro="50 MB" />
              <Row label="Caption length" free="300 chars" pro="1,000 chars" />
              <Row label="Media per post" free="5" pro="10" />
              <Row
                label="Profile folders / collections"
                free={<OutlineMinus className="inline h-4 w-4 text-muted-foreground" />}
                pro={<OutlineCheck className="inline h-4 w-4 text-green-600" />}
              />
              <Row
                label="Carrot badge next to username"
                free={<OutlineMinus className="inline h-4 w-4 text-muted-foreground" />}
                pro={<OutlineCheck className="inline h-4 w-4 text-green-600" />}
              />
              <Row
                label="Profile music (up to 30s) — soon"
                free={<OutlineMinus className="inline h-4 w-4 text-muted-foreground" />}
                pro={
                  <Badge variant="secondary" className="text-xs">
                    Soon
                  </Badge>
                }
              />
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center max-w-2xl mx-auto">
          Profile music will include loudness normalization. Abuse (excessive volume, &quot;earrape&quot;, NSFW audio)
          can result in removal of access per ToS.
        </p>
      </section>

      <Separator className="mb-20" />

      <section className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="activate" className="border-b">
              <AccordionTrigger className="text-left hover:no-underline">When do perks activate?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                After Stripe confirms payment (usually within minutes). Annual lasts 12 months from purchase.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="limits" className="border-b">
              <AccordionTrigger className="text-left hover:no-underline">What are the exact limits?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Golden Carrot targets 50 MB per file, 1,000 characters per caption, and up to 10 media per post. These
                may evolve with infrastructure; this page will be updated accordingly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="manage" className="border-b">
              <AccordionTrigger className="text-left hover:no-underline">How can I manage or cancel?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Use the Stripe customer portal from your receipt or profile billing page. Monthly renews each month;
                annual ends automatically unless renewed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Security &amp; Billing</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-3">
              <OutlineShield className="h-5 w-5 mt-0.5 text-green-600" />
              <span>Payments are processed securely by Stripe with industry-standard encryption.</span>
            </div>
            <div className="flex items-start gap-3">
              <OutlineCheck className="h-5 w-5 mt-0.5 text-green-600" />
              <span>
                You can request a copy or deletion of your data—see our{" "}
                <Link className="underline underline-offset-4 text-foreground" href="/legal/privacy">
                  Privacy Policy
                </Link>
                .
              </span>
            </div>
            <div className="flex items-start gap-3">
              <OutlineCheck className="h-5 w-5 mt-0.5 text-green-600" />
              <span>
                By subscribing you agree to our{" "}
                <Link className="underline underline-offset-4 text-foreground" href="/legal/terms">
                  Terms of Service
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// function CurrentSubscriptionCard({
//   subscriptionStatus,
//   onStatusUpdate,
//   userId,
// }: {
//   subscriptionStatus: SubscriptionStatus
//   onStatusUpdate: () => void
//   userId?: string
// }) {
//   const [isLoading, setIsLoading] = useState(false)

//   const handleManageBilling = async () => {
//     setIsLoading(true)
//     try {
//       const response = await fetch("/api/stripe/customer-portal", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId })
//       })

//       if (response.ok) {
//         const data = await response.json()
//         if (data.url) {
//           window.open(data.url, "_blank")
//         } else {
//           toast.error("Failed to open billing portal")
//         }
//       } else {
//         toast.error("Failed to open billing portal")
//       }
//     } catch (error) {
//       console.error("Billing portal error:", error)
//       toast.error("Something went wrong. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleCancelSubscription = async () => {
//     if (
//       !confirm(
//         "Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period.",
//       )
//     ) {
//       return
//     }

//     setIsLoading(true)
//     try {
//       const response = await fetch("/api/golden-carrot/cancel-subscription", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       })

//       if (response.ok) {
//         toast.success("Subscription canceled. You will retain access until the end of your billing period.")
//         onStatusUpdate()
//       } else {
//         const error = await response.json()
//         toast.error(error.error || "Failed to cancel subscription")
//       }
//     } catch (error) {
//       console.error("Cancel subscription error:", error)
//       toast.error("Something went wrong. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   const getPlanDisplayName = (plan: string) => {
//     switch (plan) {
//       case "monthly":
//         return "Monthly"
//       case "yearly":
//         return "Annual"
//       case "day":
//         return "Debug Test"
//       default:
//         return "Premium"
//     }
//   }

//   return (
//     <div className="max-w-2xl mx-auto rounded-2xl p-6">
//       <div className="text-center space-y-4">
//         <div className="flex items-center justify-center gap-2">
//           <SolidCarrot className="size-6 text-orange-500" />
//           <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
//         </div>

//         <div>
//           <h3 className="text-2xl font-bold">Golden Carrot Premium</h3>
//           {subscriptionStatus.plan && (
//             <p className="text-muted-foreground">
//               Current plan: <span className="font-semibold">{getPlanDisplayName(subscriptionStatus.plan)}</span>
//               {subscriptionStatus.currentPeriodEnd && (
//                 <>
//                   {subscriptionStatus.cancelAtPeriodEnd
//                     ? ` • Expires ${formatDate(subscriptionStatus.currentPeriodEnd)}`
//                     : ` • Renews ${formatDate(subscriptionStatus.currentPeriodEnd)}`}
//                 </>
//               )}
//             </p>
//           )}
//         </div>

//         {subscriptionStatus.cancelAtPeriodEnd && (
//           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//             <p className="text-sm text-yellow-800">
//               Your subscription is set to cancel at the end of the current billing period. You can reactivate it anytime
//               before then.
//             </p>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row gap-3">
//           <Button
//             onClick={handleManageBilling}
//             disabled={isLoading}
//             variant="outline"
//             className="flex-1"
//           >
//             {isLoading ? "Loading..." : "Manage Billing"}
//           </Button>

//           {!subscriptionStatus.cancelAtPeriodEnd && (
//             <Button onClick={handleCancelSubscription} disabled={isLoading} variant="destructive" className="flex-1">
//               {isLoading ? "Canceling..." : "Cancel Subscription"}
//             </Button>
//           )}
//         </div>

//         <p className="text-xs text-muted-foreground">
//           Use &quot;Manage Billing&quot; to update payment methods, view invoices, or change plans
//         </p>
//       </div>
//     </div>
//   )
// }

function PerksBlock() {
  return (
    <div className="text-center space-y-8">
      <h2 className="text-3xl font-semibold flex items-center justify-center gap-3">
        What you get <SolidCarrot className="size-8 text-orange-500" />
      </h2>
      <div className="grid gap-4 max-w-2xl mx-auto">
        <div className="flex items-start gap-3 text-left">
          <OutlineCheck className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="leading-relaxed">Animated avatar & cover (GIF/WebP)</span>
        </div>
        <div className="flex items-start gap-3 text-left">
          <OutlineCheck className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="leading-relaxed">Higher limits: bigger file size, longer captions, more media per post</span>
        </div>
        <div className="flex items-start gap-3 text-left">
          <OutlineCheck className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="leading-relaxed">Carrot badge next to your username</span>
        </div>
        <div className="flex items-start gap-3 text-left">
          <OutlineCheck className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="leading-relaxed">Profile folders/collections for organization</span>
        </div>
        <div className="flex items-start gap-3 text-left">
          <OutlineCheck className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="leading-relaxed">Soon: 30-second profile music (subject to ToS & moderation)</span>
        </div>
      </div>
    </div>
  )
}

function PriceSection({
  title,
  price,
  sub,
  plan,
  userId,
  email,
  isLoading,
  setIsLoading,
  badgeText,
  subscriptionStatus,
}: {
  title: string
  price: string
  sub: string
  plan: "monthly" | "yearly" | "day"
  userId?: string
  email?: string
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  badgeText?: string
  subscriptionStatus: SubscriptionStatus
}) {
  const numericPrice = Number.parseFloat(price.replace(/[$,]/g, ""))
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    setAnimatedValue(numericPrice)
  }, [numericPrice])

  const isCurrentPlan = subscriptionStatus.isActive && subscriptionStatus.plan === plan

  return (
    <div
      className={cn(
        "max-w-md mx-auto text-center space-y-6 py-8 px-6 rounded-2xl",
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg text-muted-foreground">{title}</span>
          {badgeText && <Badge className="bg-green-100 text-green-800 border-green-200">{badgeText}</Badge>}
          {isCurrentPlan && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Current Plan</Badge>}
        </div>
        <div className="text-5xl font-bold">
          <NumberFlow
            value={animatedValue}
            format={{ style: "currency", currency: "USD" }}
          // transformTiming={{ duration: 300 }}
          />
        </div>
        <div className="text-muted-foreground">{sub}</div>
      </div>

      {isCurrentPlan ? (
        <div className="space-y-3">
          <Button disabled className="w-full h-12 text-base">
            Current Plan
          </Button>
          {/* <p className="text-xs text-muted-foreground">
            {subscriptionStatus.currentPeriodEnd &&
              `Renews on ${new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}`
            }
          </p> */}
        </div>
      ) : subscriptionStatus.isActive ? (
        <div className="space-y-3">
          <StripeCheckoutForm
            plan={plan}
            userId={userId}
            email={email}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isUpgrade={true}
          />
          {/* <p className="text-xs text-muted-foreground">
            {subscriptionStatus.currentPeriodEnd &&
              `Current plan expires on ${new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}`
            }
          </p> */}
        </div>
      ) : (
        <StripeCheckoutForm
          plan={plan}
          userId={userId}
          email={email}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  )
}

function StripeCheckoutForm({
  plan,
  userId,
  email,
  isLoading,
  setIsLoading,
  isUpgrade = false,
}: {
  plan: "monthly" | "yearly" | "day"
  userId?: string
  email?: string
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  isUpgrade?: boolean
}) {
  const [consent, setConsent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !email) {
      toast.error("Please log in to continue")
      return
    }
    if (!consent) {
      toast.info("Please confirm the withdrawal waiver to continue.")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("plan", plan)
      formData.append("userId", userId)
      formData.append("email", email)
      if (isUpgrade) {
        formData.append("isUpgrade", "true")
      }

      const response = await fetch("/api/golden-carrot/checkout", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          toast.error("No checkout URL received")
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to start checkout")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-3 text-xs text-muted-foreground text-left">
        <Checkbox
          id="eu-withdrawal-waiver"
          checked={consent}
          onCheckedChange={(v: boolean) => setConsent(!!v)}
          className="mt-0.5"
        />
        <label htmlFor="eu-withdrawal-waiver" className="leading-relaxed">
          I request immediate access to Premium and acknowledge that once payment succeeds and access begins, I
          <span className="font-medium"> lose my 14-day right of withdrawal</span> (EU). Read our{" "}
          <Link href="/legal/terms#premium" className="underline underline-offset-4">
            Terms of Service
          </Link>
          .
        </label>
      </div>

      <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || !userId || !email || !consent}>
        {isLoading ? "Processing..." : isUpgrade ? "Switch to This Plan" : "Continue with Stripe"}
      </Button>
    </form>
  )
}

function Row({ label, free, pro }: { label: string; free: React.ReactNode; pro: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium py-4">{label}</TableCell>
      <TableCell className="text-right text-muted-foreground py-4">{free}</TableCell>
      <TableCell className="text-right py-4">{pro}</TableCell>
    </TableRow>
  )
}

export default function GoldenCarrotPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoldenCarrotContent />
    </Suspense>
  )
}
