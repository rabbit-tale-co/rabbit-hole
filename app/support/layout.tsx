import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Support RabbitHole',
  description:
    'Your contribution directly supports hosting, storage, and development of RabbitHole.',
  openGraph: {
    title: 'Support RabbitHole',
    description: 'Your support allows RabbitHole to grow faster and better.',
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
