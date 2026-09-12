import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/about", "/login", "/register"], disallow: ["/admin/", "/api/"] },
    sitemap: "https://cashdash.app/sitemap.xml",
  };
}
