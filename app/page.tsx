import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "RabbitHole | Home",
  description: "Discover and share creative posts.",
  openGraph: {
    title: "RabbitHole",
    url: "/",
    images: [{ url: "/assets/og.webp" }],
  },
  twitter: { title: "RabbitHole", images: [{ url: "/assets/og.webp" }] },
};

import { MainFeed } from "@/components/feed/MainFeed";
export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function HomePage() {
  // Main feed with feed selector for following, discover, and custom rabbit holes
  return <MainFeed />;
}
