import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How we collect, use, and protect your data.',
};

export const dynamic = 'force-static';
export const revalidate = 60 * 60;

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
