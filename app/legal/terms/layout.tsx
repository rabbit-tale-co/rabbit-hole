import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Your rights and responsibilities when using the Service.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
