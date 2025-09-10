"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	OutlineChevronRight,
	OutlinePlus,
	SolidLogo,
} from "@/components/icons/Icons";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { AuthModal } from "./auth/AuthModal";
import PostButton from "./feed/upload/post-button";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "./ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { UserProfileMenu } from "./user/Menu";

interface RabbitHole {
	id: string;
	name: string;
	color?: string;
	memberCount?: number;
}

export default function Header() {
	const isMobile = useIsMobile();
	const pathname = usePathname();
	const { user: auth_user, loading } = useAuth();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
	const [isMobileExpanded, setIsMobileExpanded] = useState(false);

	const [rabbitHoles, setRabbitHoles] = useState<RabbitHole[]>([
		{ id: "general", name: "General", color: "bg-primary", memberCount: 1234 },
		{ id: "tech", name: "Tech Talk", color: "bg-blue-500", memberCount: 856 },
		{ id: "design", name: "Design", color: "bg-purple-500", memberCount: 642 },
		{ id: "random", name: "Random", color: "bg-orange-500", memberCount: 423 },
		{ id: "gaming", name: "Gaming", color: "bg-red-500", memberCount: 789 },
		{ id: "music", name: "Music", color: "bg-pink-500", memberCount: 567 },
		{
			id: "art",
			name: "Art & Creative",
			color: "bg-indigo-500",
			memberCount: 345,
		},
	]);

	const navigationLinks = [
		{ href: "/", label: "", icon: <SolidLogo size={24} /> },
		{ href: "/explore", label: "Explore", icon: null },
		{ href: "/following", label: "Following", icon: null },
	];

	const NavLinks = ({ size = "md" }: { size?: "sm" | "md" }) => (
		<>
			{navigationLinks.map((link) => {
				const isActive = pathname === link.href;
				const hasOnlyIcon = link.icon && !link.label;
				const buttonSize = hasOnlyIcon
					? "icon"
					: size === "sm"
						? "sm"
						: "default";

				return (
					<Button
						asChild
						key={link.href}
						variant={isActive ? "default" : "ghost"}
						size={buttonSize}
						className="rounded-full"
					>
						<Link href={link.href}>
							{link.label}
							{link.icon}
						</Link>
					</Button>
				);
			})}
		</>
	);

	const CreateRabbitHoleModal = () => {
		const [newHoleName, setNewHoleName] = useState("");
		const [selectedColor, setSelectedColor] = useState("bg-primary");

		const colors = [
			"bg-primary",
			"bg-blue-500",
			"bg-purple-500",
			"bg-orange-500",
			"bg-red-500",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-green-500",
		];

		const handleCreate = () => {
			if (newHoleName.trim()) {
				const newHole: RabbitHole = {
					id: newHoleName.toLowerCase().replace(/\s+/g, "-"),
					name: newHoleName,
					color: selectedColor,
					memberCount: 1,
				};
				setRabbitHoles((prev) => [...prev, newHole]);
				setNewHoleName("");
				setSelectedColor("bg-primary");
				setShowCreateModal(false);
				setIsDesktopExpanded(true); // Auto-expand when new hole is created
				setIsMobileExpanded(true); // Auto-expand when new hole is created
			}
		};

		return (
			<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create New Rabbit Hole</DialogTitle>
						<DialogDescription>
							Create a new community space for your interests.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium mb-2 block">Name</label>
							<input
								type="text"
								value={newHoleName}
								onChange={(e) => setNewHoleName(e.target.value)}
								placeholder="Enter rabbit hole name..."
								className="w-full px-3 py-2 border rounded-md bg-input text-foreground"
								onKeyDown={(e) => e.key === "Enter" && handleCreate()}
							/>
						</div>

						<div>
							<label className="text-sm font-medium mb-2 block">Color</label>
							<div className="flex gap-2 flex-wrap">
								{colors.map((color) => (
									<button
										key={color}
										onClick={() => setSelectedColor(color)}
										className={cn(
											"rounded-full border-2 transition-all",
											color,
											selectedColor === color
												? "border-foreground scale-110"
												: "border-border",
										)}
									/>
								))}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowCreateModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={!newHoleName.trim()}>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	};

	const MobileBottomNav = () => {
		const navRef = useRef<HTMLElement | null>(null);
		useEffect(() => {
			const el = navRef.current;
			if (!el) return;
			const apply = () => {
				const h = el.offsetHeight || 0;
				try {
					document.documentElement.style.setProperty(
						"--mobile-bottom-nav-height",
						`${h}px`,
					);
				} catch {}
			};
			apply();
			const ro = new ResizeObserver(() => apply());
			ro.observe(el);
			return () => {
				try {
					ro.disconnect();
				} catch {}
				try {
					document.documentElement.style.removeProperty(
						"--mobile-bottom-nav-height",
					);
				} catch {}
			};
		}, []);

		return (
			<nav
				ref={navRef}
				className="sm:hidden fixed inset-x-0 bottom-0 z-50"
				style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
			>
				<div className="mx-auto w-fit gap-2 pb-3 pt-2 flex flex-col justify-center items-center">
					{auth_user && <PostButton />}
					<div className="rounded-full bg-background/90 dark:bg-black/80 backdrop-blur-2xl ring-1 ring-border">
						<div className="flex items-center gap-1 p-1 w-fit">
							<NavLinks size="sm" />
						</div>
					</div>
				</div>
			</nav>
		);
	};

	return (
		<>
			<header
				className="sticky top-0 z-50"
				style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
			>
				{/* Top Row - Logo, Navigation, Rabbit Holes and User Actions */}
				<div className="flex items-center justify-between h-16 gap-4">
					<div className="flex items-center gap-2">
						{/* Secondary Navigation */}
						<nav className="hidden lg:flex rounded-full p-1 items-center gap-1 bg-background">
							<NavLinks />
						</nav>

						{/* Rabbit Holes - Desktop Dropdown */}
						<div className="hidden lg:block p-1 rounded-full bg-background">
							<DropdownMenu
								open={isDesktopExpanded}
								onOpenChange={setIsDesktopExpanded}
							>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
									>
										Rabbit Holes
										<OutlineChevronRight
											size={16}
											className={cn(
												"transition-transform duration-150",
												isDesktopExpanded ? "rotate-90" : "",
											)}
										/>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent sideOffset={16} className="w-80 p-4">
									<div className="flex items-center gap-2 mb-3">
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													size={"smIcon"}
													variant="outline"
													className="rounded-full p-0 border-dashed border-2 hover:border-solid hover:bg-muted/50 bg-transparent"
													onClick={() => setShowCreateModal(true)}
												>
													<OutlinePlus size={16} />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Create new Rabbit Hole community</p>
											</TooltipContent>
										</Tooltip>
										<span className="text-sm font-medium">Create New</span>
									</div>

									<div className="max-h-60 overflow-y-auto">
										<div className="grid grid-cols-1 gap-2">
											{rabbitHoles.map((hole) => {
												const isActive =
													pathname === `/rabbit-hole/${hole.id}` ||
													(pathname === "/" && hole.id === "general");

												return (
													<DropdownMenuItem key={hole.id} asChild>
														<Link
															href={
																hole.id === "general"
																	? "/"
																	: `/rabbit-hole/${hole.id}`
															}
															className="flex items-center gap-3 p-2"
														>
															<div
																className={cn(
																	"size-2 rounded-full ring-1 ring-border",
																	hole.color,
																)}
															/>
															<div className="flex flex-col items-start">
																<span
																	className={cn(
																		"text-sm font-medium",
																		isActive && "text-primary",
																	)}
																>
																	{hole.name}
																</span>
																<span
																	className={cn(
																		"text-xs",
																		isActive
																			? "text-primary/70"
																			: "text-muted-foreground",
																	)}
																>
																	{hole.memberCount} members
																</span>
															</div>
														</Link>
													</DropdownMenuItem>
												);
											})}
										</div>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="block lg:hidden p-1 rounded-full bg-background">
							<Drawer
								open={isMobileExpanded}
								onOpenChange={setIsMobileExpanded}
							>
								<DrawerTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
									>
										Rabbit Holes
										<OutlineChevronRight
											size={16}
											className={cn(
												"ml-2 transition-transform duration-150",
												isMobileExpanded ? "rotate-90" : "",
											)}
										/>
									</Button>
								</DrawerTrigger>
								<DrawerContent className="max-h-[80vh]">
									<div className="mx-auto w-full max-w-sm">
										<DrawerHeader className="text-center">
											<DrawerTitle>Rabbit Holes</DrawerTitle>
										</DrawerHeader>

										<div className="pb-4">
											<div className="flex items-center gap-2 mb-4">
												<Button
													size="smIcon"
													variant="outline"
													className="rounded-full p-0 border-dashed border-2 hover:border-solid hover:bg-muted/50 bg-transparent"
													onClick={() => setShowCreateModal(true)}
												>
													<OutlinePlus size={16} />
												</Button>
												<span className="text-sm font-medium">Create New</span>
											</div>

											<div className="space-y-2">
												{rabbitHoles.map((hole) => {
													const isActive =
														pathname === `/rabbit-hole/${hole.id}` ||
														(pathname === "/" && hole.id === "general");

													return (
														<Button
															key={hole.id}
															asChild
															variant={isActive ? "default" : "ghost"}
															className={cn(
																"w-full justify-start rounded-lg px-3 py-3 text-sm font-medium transition-all h-auto",
																isActive
																	? "bg-primary text-primary-foreground shadow-sm"
																	: "hover:bg-muted hover:text-foreground",
															)}
														>
															<Link
																href={
																	hole.id === "general"
																		? "/"
																		: `/rabbit-hole/${hole.id}`
																}
																className="flex items-center gap-3 w-full"
															>
																<div
																	className={cn(
																		"size-2 rounded-full flex-shrink-0 ring-1 ring-border",
																		hole.color,
																	)}
																/>
																<div className="flex flex-col items-start text-left min-w-0">
																	<span className="font-medium truncate">
																		{hole.name}
																	</span>
																	<span
																		className={cn(
																			"text-xs truncate",
																			isActive
																				? "text-primary-foreground/70"
																				: "text-muted-foreground",
																		)}
																	>
																		{hole.memberCount} members
																	</span>
																</div>
															</Link>
														</Button>
													);
												})}
											</div>
										</div>
									</div>
								</DrawerContent>
							</Drawer>
						</div>
					</div>

					<div className="flex items-center gap-2 flex-shrink-0">
						{/* User Actions */}
						{auth_user ? (
							<div className="flex rounded-full p-1 bg-background items-center gap-2">
								<PostButton className="hidden sm:block" />
								<UserProfileMenu className="ring-1 ring-border/30 h-full w-full" />
							</div>
						) : (
							!loading &&
							!auth_user && (
								<div className="flex rounded-full p-1 bg-background items-center gap-2">
									<AuthModal />
								</div>
							)
						)}
					</div>
				</div>
			</header>

			<CreateRabbitHoleModal />

			{isMobile && <MobileBottomNav />}
		</>
	);
}
