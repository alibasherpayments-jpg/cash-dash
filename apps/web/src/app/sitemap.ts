import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-production-79a62.up.railway.app";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/offers`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
