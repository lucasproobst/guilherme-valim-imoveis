import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getSlugsPublicados } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/imoveis`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contato`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let imoveis: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getSlugsPublicados();
    imoveis = slugs.map((s) => ({
      url: `${SITE_URL}/imoveis/${s.slug}`,
      lastModified: new Date(s.atualizadoEm),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // banco indisponível no build — devolve só as rotas estáticas
  }

  return [...estaticas, ...imoveis];
}
