// import { supabaseAdmin } from "@/lib/supabase-admin";
import Feed from "@/components/feed/Index";
import { getFeedPage } from "@/app/actions/posts";

export const revalidate = 0; // fresh; you can tune with ISR if desired

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ skeleton?: string }> }) {
  const limit = 24;

  // Debug: allow forcing skeleton with ?skeleton=1
  const sp = (await searchParams) ?? {};
  if (sp.skeleton === "1") {
    return <Feed debugLoading />;
  }

  const res = await getFeedPage({ limit });
  if ("error" in res && res.error) {
    // degrade gracefully: show empty initial, client will load with hook
    return <Feed />;
  }
  return <Feed initial={{ items: res.items ?? [], nextCursor: res.nextCursor ?? null }} />;
}
