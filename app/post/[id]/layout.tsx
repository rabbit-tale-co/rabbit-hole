export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let authorId: string | null = null;
  let text: string | null = null;
  try {
    const { data } = await supabaseAdmin
      .from("posts")
      .select("author_id,text")
      .eq("id", id)
      .maybeSingle();
    authorId = (data as { author_id?: string | null } | null)?.author_id ?? null;
    text = (data as { text?: string | null } | null)?.text ?? null;
  } catch { }

  let displayLabel: string | null = null;
  if (authorId) {
    try {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("display_name,username")
        .eq("user_id", authorId)
        .maybeSingle();
      const d = prof as { display_name?: string | null; username?: string | null } | null;
      displayLabel = (d?.display_name?.trim() || d?.username || null) ?? null;
    } catch { }
  }

  // build preview from post text
  let preview = text?.replace(/\s+/g, " ").trim() ?? "";
  if (preview.length > 120) preview = preview.slice(0, 117) + "...";
  const url = `/post/${id}`;

  const title = `${displayLabel || "RabbitHole"}${preview ? " - " + preview : ""}`;
  const description = preview || "Post";

  return {
    title,
    description,
    openGraph: { title, description, url, images: [{ url: "/assets/og.webp" }] },
    twitter: { title, description, images: [{ url: "/assets/og.webp" }] },
  };
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
