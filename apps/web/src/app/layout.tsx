import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-production-79a62.up.railway.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Cash Dash - Play Games, Complete Offers & Earn Instant Cash Rewards",
    template: "%s | Cash Dash Rewards",
  },
  description:
    "Join thousands of users earning real money and crypto by playing games, taking surveys, and completing tasks. Instant cashouts starting at just $0.10 USD via Vodafone Cash & Binance.",
  keywords: [
    "cash dash",
    "cash dash rewards",
    "earn money online",
    "play games for cash",
    "paid surveys",
    "instant cashout",
    "vodafone cash rewards",
    "binance crypto rewards",
    "complete offers",
    "get paid to test apps",
    "free crypto rewards",
    "earn points redeem cash",
    "gpt sites 2026",
    "best reward platform",
  ],
  authors: [{ name: "Cash Dash Team", url: appUrl }],
  creator: "Cash Dash",
  publisher: "Cash Dash",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Cash Dash Rewards",
    title: "Cash Dash - Play Games, Complete Offers & Earn Instant Cash Rewards",
    description: "Turn your free time into cash. Complete surveys, play mobile games, and cash out instantly starting from just $0.10 USD.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cash Dash - Earn Instant Cash Rewards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Dash - Play Games, Complete Offers & Earn Instant Cash Rewards",
    description: "Turn your free time into cash. Complete surveys, play mobile games, and cash out instantly starting from just $0.10 USD.",
    images: ["/images/og-image.png"],
    creator: "@CashDashApp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="black"
          themes={["black", "mint", "aura"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
