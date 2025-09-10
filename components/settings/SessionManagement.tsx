"use client";

import React from "react";
import {
	OutlineMobile02,
	OutlineMonitor,
	OutlineShield,
	OutlineTablet,
	OutlineTrash,
	OutlineWarning,
} from "@/components/icons/Icons";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSessionManagement } from "@/hooks/useSessionManagement";
// import { toast } from "sonner";

export function SessionManagement() {
	const {
		sessions,
		loading,
		error,
		revokeSession,
		revokeAllOtherSessions,
		formatDate,
		formatRelativeTime,
	} = useSessionManagement();

	const getDeviceIcon = (deviceInfo: string) => {
		const device = deviceInfo.toLowerCase();
		if (
			device.includes("mobile") ||
			device.includes("android") ||
			device.includes("iphone")
		) {
			return <OutlineMobile02 size={16} />;
		}
		if (device.includes("tablet") || device.includes("ipad")) {
			return <OutlineTablet size={16} />;
		}
		return <OutlineMonitor size={16} />;
	};

	const handleRevokeSession = async (sessionId: string) => {
		try {
			await revokeSession(sessionId);
		} catch (error) {
			console.error("Error revoking session:", error);
		}
	};

	const handleRevokeAllOtherSessions = async () => {
		try {
			await revokeAllOtherSessions();
		} catch (error) {
			console.error("Error revoking all sessions:", error);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<OutlineShield className="h-6 w-6" />
						Active Sessions
					</h2>
					<p className="text-muted-foreground">
						Manage your active sessions and devices
					</p>
				</div>
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<OutlineShield className="h-6 w-6" />
						Active Sessions
					</h2>
					<p className="text-muted-foreground">
						Manage your active sessions and devices
					</p>
				</div>
				<div className="text-center py-8">
					<OutlineWarning className="size-12 text-destructive mx-auto mb-4" />
					<p className="text-destructive mb-4">{error}</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
				</div>
			</div>
		);
	}

	const currentSessions = sessions.filter((session) => session.is_current);
	const otherSessions = sessions.filter((session) => !session.is_current);

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<OutlineShield className="h-6 w-6" />
					Active Sessions
				</h2>
				<p className="text-muted-foreground">
					Manage your active sessions and devices. You can revoke access from
					any device except your current one.
				</p>
			</div>
			{/* Current Session */}
			{currentSessions.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Current Session</h3>
					{currentSessions.map((session) => (
						<div key={session.id} className="border rounded-lg p-4 bg-muted/50">
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-3">
									{getDeviceIcon(session.device_info)}
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<p className="font-medium">{session.device_info}</p>
											<Badge variant="secondary">Current</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{session.location} • {session.ip_address}
										</p>
										<p className="text-sm text-muted-foreground">
											Last activity: {formatRelativeTime(session.last_activity)}
										</p>
										<p className="text-xs text-muted-foreground">
											Started: {formatDate(session.created_at)}
										</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Other Sessions */}
			{otherSessions.length > 0 && (
				<>
					<Separator />
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Other Sessions</h3>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="outline" size="sm">
										Revoke All Others
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Revoke All Other Sessions
										</AlertDialogTitle>
										<AlertDialogDescription>
											This will sign out all other devices and browsers. You
											will remain signed in on this device. Are you sure you
											want to continue?
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={handleRevokeAllOtherSessions}>
											Revoke All Others
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>

						<div className="space-y-3">
							{otherSessions.map((session) => (
								<div key={session.id} className="border rounded-lg p-4">
									<div className="flex items-start justify-between">
										<div className="flex items-start gap-3">
											{getDeviceIcon(session.device_info)}
											<div className="space-y-1">
												<p className="font-medium">{session.device_info}</p>
												<p className="text-sm text-muted-foreground">
													{session.location} • {session.ip_address}
												</p>
												<p className="text-sm text-muted-foreground">
													Last activity:{" "}
													{formatRelativeTime(session.last_activity)}
												</p>
												<p className="text-xs text-muted-foreground">
													Started: {formatDate(session.created_at)}
												</p>
											</div>
										</div>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="outline" size="sm">
													<OutlineTrash size={16} />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Revoke Session</AlertDialogTitle>
													<AlertDialogDescription>
														This will sign out the device &quot;
														{session.device_info}&quot; from your account. Are
														you sure you want to continue?
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleRevokeSession(session.id)}
													>
														Revoke Session
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							))}
						</div>
					</div>
				</>
			)}

			{/* No Other Sessions */}
			{otherSessions.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					<OutlineMonitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>No other active sessions found.</p>
					<p className="text-sm">You&apos;re only signed in on this device.</p>
				</div>
			)}

			{/* Security Notice */}
			<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
				<div className="flex items-start gap-3">
					<OutlineWarning className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
					<div className="space-y-1">
						<p className="text-sm font-medium text-amber-800 dark:text-amber-200">
							Security Notice
						</p>
						<p className="text-sm text-amber-700 dark:text-amber-300">
							If you see any unfamiliar sessions or devices, revoke them
							immediately and consider changing your password.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
