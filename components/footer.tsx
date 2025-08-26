"use client";

import Link from "next/link";
import { OutlineArrowRight, SolidLogo } from "@/components/icons/Icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { label: "GitHub", href: "https://github.com/rabbit-tale-co", icon: "GH" },
    { label: "Twitter", href: "https://twitter.com/hasiradoo", icon: "TW" },
    { label: "Bsky", href: "https://bsky.app/profile/hasiradoo.rabbittale.co", icon: "BS" },
    { label: "Patreon", href: "https://patreon.com/rabbittale", icon: "PA" },
    { label: "Discord", href: "https://discord.gg/rabbittale", icon: "DC" },
    { label: "Telegram", href: "https://t.me/rabbit_tale", icon: "TG" },
  ];

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "About", href: "/about" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ];

  const resourceLinks = [
    { label: "RabbitTale Studio", href: "https://rabbittale.co" },
    // { label: "Blog", href: "https://blog.rabbittale.co" },
    { label: "Source Code", href: "https://github.com/rabbit-tale-co/portfolio" },
  ];

  const LinkWithArrow = ({ href, label, isExternal = false }: { href: string; label: string; icon?: string; isExternal?: boolean }) => (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="flex items-center gap-3 text-xs text-background hover:text-background transition-colors tracking-wider group focus-visible:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-offset-background focus-visible:ring-offset-2 focus-visible:ring-ring"
    >
      {label}
      <OutlineArrowRight
        size={12}
        className="opacity-0 -translate-x-2 -rotate-45
          group-hover:opacity-100 group-hover:translate-x-0 group-hover:rotate-0
          transition-all duration-150 group-focus-within:opacity-100 group-focus-within:translate-x-0 group-focus-within:rotate-0"
      />
    </Link>
  );

  return (
    <footer className="mt-auto">
      <div className="">
        {/* Main Footer Content */}
        <div className="p-6 bg-foreground rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Logo and info */}
            <div className="w-full md:w-auto space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 text-background flex items-center justify-center">
                  <SolidLogo size={20} />
                </div>
                <span className="font-bold text-background text-sm uppercase tracking-wider">
                  Rabbit Hole
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-background tracking-wider">
                  Social for artists
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="w-full md:w-auto grid grid-cols-1 md:flex md:gap-8 gap-8">
              {/* Social Links */}
              <div className="space-y-4">

                <h4 className="text-xs font-bold text-background tracking-wider">
                  Socials
                </h4>

                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <LinkWithArrow
                      key={link.label}
                      href={link.href}
                      label={link.label}
                      icon={link.icon}
                      isExternal={link.href.startsWith('http')}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-background tracking-wider">
                  Navigation
                </h4>
                <div className="space-y-2">
                  {navigationLinks.map((link) => (
                    <LinkWithArrow
                      key={link.label}
                      href={link.href}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-4">

                <h4 className="text-xs font-bold text-background tracking-wider">
                  Resources
                </h4>

                <div className="space-y-2">
                  {resourceLinks.map((link) => (
                    <LinkWithArrow
                      key={link.label}
                      href={link.href}
                      label={link.label}
                      isExternal
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <SectionSeparator /> */}

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
              &copy; {currentYear} All rights reserved
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
              Made by RabbitTale Studio
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
