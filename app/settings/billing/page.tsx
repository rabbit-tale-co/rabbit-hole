"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { OutlineShield, SolidCarrot } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";

interface BillingInfo {
	is_premium: boolean;
	premium_plan?: string;
	premium_status?: string;
	premium_started_at?: string;
	last_payment_at?: string;
}

export default function BillingPage() {
	const { user, billingInfo, billingLoading, manageSubscription } = useUser();
	const [isPortalLoading, setIsPortalLoading] = useState(false);
	const handleManageSubscription = async () => {
		if (!user?.id) return;

		setIsPortalLoading(true);
		try {
			await manageSubscription();
		} catch (error) {
			console.error("Portal error:", error);
		} finally {
			setIsPortalLoading(false);
		}
	};

	if (billingLoading) {
		return (
			<div className="max-w-2xl mx-auto py-10">
				<div className="space-y-4">
					<div className="h-8 bg-neutral-200 rounded animate-pulse" />
					<div className="h-32 bg-neutral-200 rounded animate-pulse" />
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto py-10 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Billing & Subscription</h1>
				<p className="text-neutral-600 mt-1">
					Manage your Golden Carrot subscription and billing information.
				</p>
			</div>

			{billingInfo?.is_premium ? (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<SolidCarrot className="size-5" />
								<CardTitle>Golden Carrot Active</CardTitle>
							</div>
							<Badge
								variant="secondary"
								className="bg-green-100 text-green-800"
							>
								Active
							</Badge>
						</div>
						<CardDescription>
							You&apos;re currently subscribed to the {billingInfo.premium_plan}{" "}
							plan.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-neutral-600">Plan</p>
								<p className="font-medium capitalize">
									{billingInfo.premium_plan || "Unknown"}
								</p>
							</div>
							<div>
								<p className="text-neutral-600">Status</p>
								<p className="font-medium capitalize">
									{billingInfo.premium_status || "Active"}
								</p>
							</div>
							{billingInfo.premium_started_at && (
								<div>
									<p className="text-neutral-600">Started</p>
									<p className="font-medium">
										{new Date(
											billingInfo.premium_started_at,
										).toLocaleDateString()}
									</p>
								</div>
							)}
							{billingInfo.last_payment_at && (
								<div>
									<p className="text-neutral-600">Last Payment</p>
									<p className="font-medium">
										{new Date(billingInfo.last_payment_at).toLocaleDateString()}
									</p>
								</div>
							)}
						</div>

						<Separator />

						<div className="space-y-3">
							<Button
								onClick={handleManageSubscription}
								disabled={isPortalLoading}
								className="w-full"
							>
								{isPortalLoading ? "Loading..." : "Manage Subscription"}
							</Button>
							<p className="text-xs text-neutral-500 text-center">
								Update payment method, view invoices, or cancel your
								subscription
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>No Active Subscription</CardTitle>
						<CardDescription>
							You don&apos;t have an active Golden Carrot subscription.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/golden-carrot">
							<Button className="w-full">
								<SolidCarrot className="size-4 mr-2" />
								Upgrade to Golden Carrot
							</Button>
						</Link>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<OutlineShield className="size-5" />
						Security & Privacy
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-neutral-600">
					<p>• All payments are processed securely by Stripe</p>
					<p>• We never store your payment information</p>
					<p>• You can cancel your subscription anytime</p>
					<p>
						• See our{" "}
						<Link href="/legal/privacy" className="underline">
							Privacy Policy
						</Link>{" "}
						for more details
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
