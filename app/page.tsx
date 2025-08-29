import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "RabbitHole | Home",
  description: "Discover and share creative posts.",
  openGraph: { title: "RabbitHole", url: "/", images: [{ url: "/assets/og.webp" }] },
  twitter: { title: "RabbitHole", images: [{ url: "/assets/og.webp" }] },
};
import Feed from "@/components/feed/Index";
export const dynamic = 'force-static';
export const revalidate = 60 * 5;

export default async function HomePage() {
  // Render statyczny; dane laduje klient przez /api/posts (CSR)
  return <Feed />;
}
