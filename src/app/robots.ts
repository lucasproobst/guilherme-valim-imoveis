import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // o painel e as rotas de API não devem ser indexados
      disallow: ["/painel", "/login", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
