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
  title: {
    default: "Cash Dash - Complete Offers. Earn Points. Get Rewarded.",
    template: "%s | Cash Dash",
  },
  description:
    "Join thousands of users earning real rewards by completing surveys, trying apps, and more. Convert points to cash instantly.",
  keywords: ["earn rewards", "cashback", "surveys", "offers", "points", "rewards program"],
  authors: [{ name: "Cash Dash" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cashdash.app",
    siteName: "Cash Dash",
    title: "Cash Dash - Complete Offers. Earn Points. Get Rewarded.",
    description: "Join thousands of users earning real rewards by completing surveys, trying apps, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Dash",
    description: "Earn rewards by completing offers and surveys.",
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
