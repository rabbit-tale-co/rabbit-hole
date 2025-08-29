import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Golden Carrot — Premium',
  description: 'Animated avatars and covers, higher limits, profile folders, and more.',
  openGraph: {
    title: 'Golden Carrot — Premium',
    description: 'Unlock animated avatar/cover, bigger uploads, longer captions, more media per post, and profile folders.',
  },
};

export default function GoldenCarrotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
