import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Explore",
  description: "Discover creators on RabbitHole.",
  openGraph: { title: "RabbitHole - Explore", url: "/explore", images: [{ url: "/assets/og.webp" }] },
  twitter: { title: "RabbitHole - Explore", images: [{ url: "/assets/og.webp" }] },
};
export const dynamic = 'force-dynamic';
export const revalidate = 300;

import UsersGrid from "@/components/users/Grid";
import { getUsersPage } from "@/app/actions/profile";

export default async function ExplorePage() {
  // Fetch initial data server-side with a larger batch
  const initialData = await getUsersPage({ limit: 60 });

  if ("error" in initialData) {
    return (
      <section>
        <h1 className="text-xl font-semibold">Explore creators</h1>
        <p className="text-sm text-muted-foreground">Discover people to follow.</p>
        <div className="mt-8 rounded-2xl bg-white ring-1 ring-[--border] p-10 text-center">
          <p className="text-sm font-medium">Error loading users</p>
          <p className="mt-1 text-xs text-muted-foreground">{initialData.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-xl font-semibold">Explore creators</h1>
      <p className="text-sm text-muted-foreground">Discover people to follow.</p>
      <UsersGrid initialData={initialData} />
    </section>
  );
}
