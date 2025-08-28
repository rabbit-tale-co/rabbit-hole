import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Explore",
  description: "Discover creators on RabbitHole.",
  openGraph: { title: "RabbitHole - Explore", url: "/explore", images: [{ url: "/assets/og.webp" }] },
  twitter: { title: "RabbitHole - Explore", images: [{ url: "/assets/og.webp" }] },
};
export const revalidate = 0;

import UsersGrid from "@/components/users/Grid";

export default function ExplorePage() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Explore creators</h1>
      <p className="text-sm text-muted-foreground">Discover people to follow.</p>
      <UsersGrid />
    </section>
  );
}
