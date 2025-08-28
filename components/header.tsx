'use client'

import { useIsMobile } from "@/hooks/useMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { AuthModal } from "./auth/AuthModal";
import { SolidLogo } from "@/components/icons/Icons";

import { UserProfileMenu } from "./user/Menu";
import PostButton from "./feed/upload/post-button";
import { Button } from "./ui/button";
import { Crown } from "lucide-react";

export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { user: auth_user, loading } = useAuth();

  const navigationLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/explore", label: "Explore", icon: null },
    { href: "/following", label: "Following", icon: null },
    // ...(user ? [
    //   { href: "/profile", label: "Profile", icon: null },
    //   { href: "/settings", label: "Settings", icon: null },
    // ] : []),
  ];

  const NavLinks = ({ size = "md" }: { size?: "sm" | "md" }) => (
    <>
      {navigationLinks.map((link) => {
        const isActive = link.href === "/"
          ? pathname === "/" || pathname === ""
          : pathname === link.href;

        return (
          <Button asChild key={link.href} variant={isActive ? "default" : "ghost"} className={cn(size === "sm" ? "rounded-md" : "rounded-lg")} size={size === "sm" ? "sm" : "default"}>
            <Link
              href={link.href}
            >
              {link.icon && <span className="text-base">{link.icon}</span>}
              {link.label}
            </Link>
          </Button>
        );
      })}
    </>
  );

  const MobileBottomNav = () => {
    const navRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      const el = navRef.current;
      if (!el) return;
      const apply = () => {
        const h = el.offsetHeight || 0;
        try { document.documentElement.style.setProperty("--mobile-bottom-nav-height", `${h}px`); } catch { }
      };
      apply();
      const ro = new ResizeObserver(() => apply());
      ro.observe(el);
      return () => {
        try { ro.disconnect(); } catch { }
        try { document.documentElement.style.removeProperty("--mobile-bottom-nav-height"); } catch { }
      };
    }, []);

    return (
      <nav
        ref={navRef}
        className="sm:hidden fixed inset-x-0 bottom-0 z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto w-fit gap-2 px-4 pb-3 pt-2 flex flex-col justify-center items-center">
          {auth_user && <PostButton />}
          <div className="rounded-lg bg-background/90 dark:bg-black/80 backdrop-blur-2xl ring-1 ring-border">
            <div className="flex items-center gap-1 p-1 w-fit">
              {/* left links */}
              <NavLinks size="sm" />
            </div>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button or Logo */}
          <div className="flex items-center justify-start">
            <Link href={"/"} className="p-2 bg-background rounded-xl flex items-center gap-2">
              <SolidLogo size={32} />
            </Link>
          </div>

          {/* Center - Navigation */}
          <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <nav className="hidden lg:flex rounded-xl p-1 items-center gap-1 bg-background/90 dark:bg-black/80 backdrop-blur-2xl">
              <NavLinks />
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center justify-end">
            <div className="flex rounded-full p-1 bg-background/90 dark:bg-black/80 backdrop-blur-2xl items-center gap-2">
              <Button variant="ghost" asChild className="rounded-full bg-amber-100 text-amber-950 hover:bg-amber-200">
                <Link href="/support">
                  <Crown size={20} />
                  <span className="text-sm">Support</span>
                </Link>
              </Button>
              {/* Authentication */}
              {auth_user && (
                <div className="flex items-center gap-2">
                  <PostButton className="hidden sm:block" />
                  {/* Notifications */}
                  {/* <Button variant="ghost" size="icon" className="relative rounded-full">
                  <OutlineBell size={20} />
                  <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
                </Button> */}
                  <UserProfileMenu />
                </div>
              )}

              {!loading && !auth_user && (
                <div className="pointer-events-auto">
                  <AuthModal />
                </div>
              )}

              {/* Desktop theme toggle */}
              {/* {!isMobile && <ModeToggle />} */}
            </div>
          </div>
        </div>
      </header >
      {isMobile && <MobileBottomNav />}
    </>
  );
}
