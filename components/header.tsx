'use client'

import { useIsMobile } from "@/hooks/useMobile";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription
} from "./ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { AuthModal } from "./auth/AuthModal";
// import { UserProfileMenu } from "./auth/user-profile-menu";
// import { CreatePost } from "./upload/create-post";
// import PostButton from "./upload/post-button";
import { ArrowLeft } from "lucide-react";
import { OutlineBell, OutlineClose, OutlineMenu, SolidLogo } from "@/components/icons/Icons";
import { generateAccentColor } from "@/lib/accent-colors";
import { UserProfileMenu } from "./user/Menu";

export default function Header() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navigationLinks = [
    { href: "/", label: "Home", icon: null },
    // { href: "/explore", label: "Explore", icon: null },
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
          <nav className="hidden lg:flex rounded-xl p-1 items-center gap-1 bg-background/90 dark:bg-black/80 backdrop-blur-2xl" suppressHydrationWarning>
            <NavLinks />
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center justify-end">
          <div className="flex rounded-full p-1 bg-background/90 dark:bg-black/80 backdrop-blur-2xl items-center gap-3">

            {/* Authentication */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* <PostButton accentColor={userAccentColor} /> */}
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <OutlineBell size={20} />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full" />
                </Button>
                <UserProfileMenu />
              </div>
            ) : (
              <AuthModal />
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
                      <SheetClose asChild>
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <OutlineClose size={20} />
                        </button>
                      </SheetClose>
                    </div>

                    {/* Mobile search */}
                    <div className="p-4 border-b">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search artists, artworks..."
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-background dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex flex-col gap-2 p-4">
                      <NavLinks onClick={() => setIsOpen(false)} />

                      {/* Mobile profile link */}
                      {user && (
                        <Button asChild variant="ghost">
                          <Link
                            href={`/user/${user.user_metadata?.username || user.id}`}
                            onClick={() => setIsOpen(false)}
                          >
                            Profile
                          </Link>
                        </Button>
                      )}

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
    </header>
  );
}
