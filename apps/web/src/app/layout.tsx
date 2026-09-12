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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://web-production-79a62.up.railway.app"),
  title: {
    default: "Cash Dash - Complete Offers. Earn Points. Get Rewarded.",
    template: "%s | Cash Dash",
  },
  description:
    "Join thousands of users earning real rewards by completing surveys, trying apps, and more. Convert points to cash instantly.",
  keywords: ["earn rewards", "cashback", "surveys", "offers", "points", "rewards program"],
  authors: [{ name: "Cash Dash" }],
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
    url: "https://cashdash.app",
    siteName: "Cash Dash",
    title: "Cash Dash - Complete Offers. Earn Points. Get Rewarded.",
    description: "Join thousands of users earning real rewards by completing surveys, trying apps, and more.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cash Dash Rewards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Dash",
    description: "Earn rewards by completing offers and surveys.",
    images: ["/images/og-image.png"],
  },
  robots: { index: true, follow: true },
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
