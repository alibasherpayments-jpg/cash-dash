import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-production-79a62.up.railway.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/contact",
          "/offers",
          "/leaderboard",
          "/login",
          "/register",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/dashboard",
          "/dashboard/*",
          "/wallet",
          "/wallet/*",
          "/withdraw",
          "/withdraw/*",
          "/profile",
          "/profile/*",
          "/support",
          "/support/*",
          "/notifications",
          "/notifications/*",
          "/achievements",
          "/referrals",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
