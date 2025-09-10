import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Following",
  description: "Posts from people you follow on RabbitHole.",
  openGraph: {
    title: "RabbitHole - Following",
    url: "/following",
    images: [{ url: "/assets/og.webp" }],
  },
  twitter: {
    title: "RabbitHole - Following",
    images: [{ url: "/assets/og.webp" }],
  },
};
export const dynamic = "force-dynamic";
export const revalidate = 300;

import FollowingFeed from "@/components/feed/FollowingFeed";

export default function FollowingPage() {
  return <FollowingFeed />;
}
