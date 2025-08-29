export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const username = params.username;
  // fetch display_name for nicer title; fall back to username
  let displayName: string | null = null;
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("username", username)
      .maybeSingle();
    displayName = (data as { display_name?: string | null } | null)?.display_name ?? null;
  } catch { }
  const title = `${displayName?.trim() || username}`;
  const url = `/user/${username}`;
  return {
    title,
    openGraph: { title, url, images: [{ url: "/assets/og.webp" }] },
    twitter: { title, images: [{ url: "/assets/og.webp" }] },
  };
}


export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
