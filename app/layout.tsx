import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Container } from "@/components/container";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  minimumScale: 1,
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

// TODO: add to cropping function presets (full square), rectangle, 16:9, 4:3, 3:4, 9:16, 1:1
// TODO: svg in button mt-.5? to center vertically?

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
        <SpeedInsights />
        <Analytics />
        <div className="flex flex-col min-h-screen">
          <Container>
            <AuthProvider>
              <Header />
              {/* TODO: for profile page mx-auto max-w-xl */}
              <div className="flex-1 min-h-dvh sm:pb-5">
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
