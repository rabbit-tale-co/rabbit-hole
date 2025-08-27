'use client'

import { useIsMobile } from "@/hooks/useMobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { useAuth } from "@/providers/AuthProvider";
import { AuthModal } from "./auth/AuthModal";
import { OutlineMenu, SolidLogo } from "@/components/icons/Icons";

import { UserProfileMenu } from "./user/Menu";
import PostButton from "./feed/upload/post-button";

export default function Header() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
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

  const NavLinks = ({ onClick, className }: { onClick?: () => void, className?: string }) => (
    <>
      {navigationLinks.map((link) => {
        const isActive = link.href === "/"
          ? pathname === "/" || pathname === ""
          : pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-black text-background dark:bg-background dark:text-black"
                : "text-neutral-950 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:text-neutral-100",
              className
            )}
          >
            {link.icon && <span className="text-base">{link.icon}</span>}
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50">
      <div className="flex items-center justify-between h-16">
        {/* Left side - Back button or Logo */}
        <div className="flex items-center justify-start">
          <div className="p-2 bg-background rounded-xl flex items-center gap-2">
            <SolidLogo size={32} />
          </div>
        </div>

        {/* Center - Navigation */}
        <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2">
          <nav className="hidden lg:flex rounded-xl p-1 items-center gap-1 bg-background/90 dark:bg-black/80 backdrop-blur-2xl">
            <NavLinks />
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center justify-end">
          <div className="flex rounded-full p-1 bg-background/90 dark:bg-black/80 backdrop-blur-2xl items-center gap-3">

            {/* Authentication */}
            {auth_user && (
              <div className="flex items-center gap-2">
                <PostButton />
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

            {/* Mobile menu */}
            {isMobile && (
              <div suppressHydrationWarning>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <OutlineMenu size={20} />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-sm p-0">
                    <div className="sr-only">
                      <SheetTitle>Navigation Menu</SheetTitle>
                      <SheetDescription>Main navigation and search</SheetDescription>
                    </div>

                    {/* Mobile header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">Menu</span>
                      </div>
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex flex-col gap-2 p-4">
                      <NavLinks onClick={() => setIsOpen(false)} />
                      {/* Mobile create post button */}
                      {/* <PostButton accentColor={userAccentColor} /> */}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {/* Desktop theme toggle */}
            {/* {!isMobile && <ModeToggle />} */}
          </div>
        </div>
      </div>
    </header >
  );
}
