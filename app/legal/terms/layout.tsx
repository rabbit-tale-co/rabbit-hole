import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Your rights and responsibilities when using the Service.',
};

export const dynamic = 'force-static';
export const revalidate = 3600;

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
