import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm",
  description: "Confirm your authentication and continue.",
  robots: { index: false },
  openGraph: { title: "RabbitHole - Confirm", url: "/auth/confirm", images: [{ url: "/assets/og.webp" }] },
  twitter: { title: "RabbitHole - Confirm", images: [{ url: "/assets/og.webp" }] },
};

export default function ConfirmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
