import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password",
  description: "Set a new password for your account.",
  robots: { index: false },
  openGraph: { title: "RabbitHole - Update Password", url: "/reset/update-password", images: [{ url: "/assets/og.webp" }] },
  twitter: { title: "RabbitHole - Update Password", images: [{ url: "/assets/og.webp" }] },
};

export default function UpdatePasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
