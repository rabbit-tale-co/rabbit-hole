import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "RabbitHole | Home",
  description: "Discover and share creative posts.",
  openGraph: { title: "RabbitHole", url: "/", images: [{ url: "/assets/og.webp" }] },
  twitter: { title: "RabbitHole", images: [{ url: "/assets/og.webp" }] },
};
import Feed from "@/components/feed/Index";
export const dynamic = 'force-dynamic';
export const revalidate = 300;

export default async function HomePage() {
  // For now, let the client handle the data fetching
  // This prevents server-side fetch issues and ensures proper infinite scroll
  return <Feed key="main-feed" />;
}
