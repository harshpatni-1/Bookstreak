import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bookstreak.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/features", "/pricing", "/faq", "/privacy", "/terms", "/contact"],
      disallow: ["/dashboard", "/shelf", "/stats", "/settings", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
