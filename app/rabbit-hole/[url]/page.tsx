import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRabbitHoleByUrl } from "@/app/actions/rabbit-holes";
import RabbitHoleFeed from "@/components/feed/RabbitHoleFeed";

export async function generateMetadata({ params }: { params: Promise<{ url: string }> }): Promise<Metadata> {
  const { url } = await params;
  const { data: rabbitHole } = await getRabbitHoleByUrl(url);

  if (!rabbitHole) {
    return {
      title: "Rabbit Hole Not Found",
    };
  }

  return {
    title: `${rabbitHole.name} - RabbitHole`,
    description: rabbitHole.description || `Posts from ${rabbitHole.name} rabbit hole`,
    openGraph: {
      title: `${rabbitHole.name} - RabbitHole`,
      description: rabbitHole.description || `Posts from ${rabbitHole.name} rabbit hole`,
      url: `/rabbitholes/${rabbitHole.url}`,
      images: [{ url: "/assets/og.webp" }],
    },
    twitter: {
      title: `${rabbitHole.name} - RabbitHole`,
      description: rabbitHole.description || `Posts from ${rabbitHole.name} rabbit hole`,
      images: [{ url: "/assets/og.webp" }],
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function RabbitHolePage({ params }: { params: Promise<{ url: string }> }) {
  const { url } = await params;
  const { data: rabbitHole, error } = await getRabbitHoleByUrl(url);

  if (error || !rabbitHole) {
    notFound();
  }

  return <RabbitHoleFeed rabbitHoleName={url} />;
}
