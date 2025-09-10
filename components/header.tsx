"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SolidLogo } from "@/components/icons/Icons";
import { useIsMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { AuthModal } from "./auth/AuthModal";
import PostButton from "./feed/upload/post-button";
import { Button } from "./ui/button";
import { UserProfileMenu } from "./user/Menu";

export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { user: auth_user, loading } = useAuth();

  const navigationLinks = [
    { href: "/", label: "", icon: <SolidLogo size={24} /> },
    { href: "/explore", label: "Explore", icon: null },
    { href: "/rabbit-holes", label: "Rabbit Holes", icon: null },
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
        } catch { }
      };
      apply();
      const ro = new ResizeObserver(() => apply());
      ro.observe(el);
      return () => {
        try {
          ro.disconnect();
        } catch { }
        try {
          document.documentElement.style.removeProperty(
            "--mobile-bottom-nav-height",
          );
        } catch { }
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


      {isMobile && <MobileBottomNav />}
    </>
  );
}
