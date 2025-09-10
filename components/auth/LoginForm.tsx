"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { OutlineLoading } from "../icons/Icons";
import ShowPassword from "./ShowPassword";

export default function LoginForm({
	onSuccess,
	onForgot,
}: {
	onSuccess?: () => void;
	onForgot?: () => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPwd, setShowPwd] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { signIn } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const { error } = await signIn(email, password);
		setLoading(false);
		if (error) setError(error);
		else onSuccess?.();
	};

	return (
		<form onSubmit={handleSubmit} className={`space-y-3 max-w-md`}>
			{error && (
				<Alert variant="destructive">
					<AlertDescription className="text-xs">{error}</AlertDescription>
				</Alert>
			)}

			<div className="space-y-1">
				<Label htmlFor="email" className="text-xs">
					Email
				</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={loading}
				/>
			</div>

			<div className="space-y-1">
				<Label htmlFor="password" className="text-xs">
					Password
				</Label>
				<InputGroup>
					<Input
						id="password"
						type={showPwd ? "text" : "password"}
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
						className="pr-10"
					/>
					<InputAddon className="px-0">
						<ShowPassword showPwd={showPwd} setShowPwd={setShowPwd} />
					</InputAddon>
				</InputGroup>
			</div>

			<Button
				size={"lg"}
				type="submit"
				className="w-full rounded-full"
				disabled={loading}
			>
				{loading ? (
					<>
						<OutlineLoading className="animate-spin" />
						Signing in…
					</>
				) : (
					"Sign in"
				)}
			</Button>

			<div className="flex items-center justify-end text-xs">
				{onForgot ? (
					<button
						type="button"
						onClick={onForgot}
						className="text-muted-foreground underline underline-offset-2"
					>
						Forgot password?
					</button>
				) : (
					<Link
						href="/auth/forgot-password"
						className="text-muted-foreground underline underline-offset-2"
					>
						Forgot password?
					</Link>
				)}
			</div>
			{/* success message handled on dedicated /auth/forgot-password page */}
		</form>
	);
}
