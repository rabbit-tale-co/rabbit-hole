import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRabbitHoleByName } from "@/app/actions/rabbit-holes";
import RabbitHoleFeed from "@/components/feed/RabbitHoleFeed";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const { data: rabbitHole } = await getRabbitHoleByName(params.name);

  if (!rabbitHole) {
    return {
      title: "Rabbit Hole Not Found",
    };
  }

  return {
    title: `${rabbitHole.display_name} - RabbitHole`,
    description: rabbitHole.description || `Posts from ${rabbitHole.display_name} rabbit hole`,
    openGraph: {
      title: `${rabbitHole.display_name} - RabbitHole`,
      description: rabbitHole.description || `Posts from ${rabbitHole.display_name} rabbit hole`,
      url: `/rabbit-hole/${rabbitHole.name}`,
      images: [{ url: "/assets/og.webp" }],
    },
    twitter: {
      title: `${rabbitHole.display_name} - RabbitHole`,
      description: rabbitHole.description || `Posts from ${rabbitHole.display_name} rabbit hole`,
      images: [{ url: "/assets/og.webp" }],
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function RabbitHolePage({ params }: { params: { name: string } }) {
  const { data: rabbitHole, error } = await getRabbitHoleByName(params.name);

  if (error || !rabbitHole) {
    notFound();
  }

  return <RabbitHoleFeed rabbitHoleName={params.name} />;
}
