import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Container } from "@/components/container";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: "RabbitHole",
    template: "RabbitHole | %s",
  },
  description: "Discover and share creative posts.",
  applicationName: "RabbitHole",
  openGraph: {
    type: "website",
    siteName: "RabbitHole",
    title: "RabbitHole",
    description: "Discover and share creative posts.",
    url: "/",
    images: [
      { url: "/assets/og.webp", width: 1200, height: 630, alt: "RabbitHole" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RabbitHole",
    description: "Discover and share creative posts.",
    images: [
      { url: "/assets/og.webp" },
    ],
  },
  other: {
    "theme-color": "#000000",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

// FIXME: grid is not pushing 1x1 to bottom of page (it sticks to top of page)
// + it's not from newest (top left) to oldest (bottom right)
// FIXME: sometimes uplaod post stuck at 0%

//TODO: replace all <video> with media-player component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <div className="flex flex-col min-h-screen">
          <Container>
            <AuthProvider>
              <Header />
              <div className="flex-1 min-h-dvh sm:py-10">
                {children}
              </div>
              <Footer />
              <Toaster />
            </AuthProvider>
          </Container>
        </div>
      </body>
    </html>
  );
}
