import type { Metadata } from "next";
import RabbitHolesPage from "@/components/rabbit-holes/RabbitHolesPage";

export const metadata: Metadata = {
  title: "Rabbit Holes | RabbitHole",
  description: "Discover and manage your rabbit holes - custom feeds for your interests.",
  openGraph: {
    title: "Rabbit Holes",
    url: "/rabbit-holes",
    images: [{ url: "/assets/og.webp" }],
  },
  twitter: { title: "Rabbit Holes", images: [{ url: "/assets/og.webp" }] },
};

export default function RabbitHolesPageRoute() {
  return <RabbitHolesPage />;
}
