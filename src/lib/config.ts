import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  CONFIG_PADRAO,
  CONFIG_SINGLETON_ID,
  type SiteConfig,
  type Stat,
  type Passo,
} from "@/lib/config-defaults";

/**
 * Lê as configurações do site (linha única) e mescla sobre os defaults.
 * Componentes de servidor usam getConfig(); os de cliente recebem via
 * ConfigProvider (useConfig). Cacheado por requisição.
 */
export type { SiteConfig };
export { CONFIG_PADRAO };

function parseStats(raw: string | null | undefined, fallback: Stat[]): Stat[] {
  if (!raw) return fallback;
  try {
    const arr = JSON.parse(raw);
    if (
      Array.isArray(arr) &&
      arr.length > 0 &&
      arr.every(
        (x) =>
          x && typeof x.numero === "string" && typeof x.rotulo === "string",
      )
    ) {
      return arr;
    }
  } catch {
    /* ignora JSON inválido */
  }
  return fallback;
}

function parseUrls(raw: string | null | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      const urls = arr.filter(
        (x): x is string => typeof x === "string" && x.trim().length > 0,
      );
      if (urls.length > 0) return urls;
    }
  } catch {
    /* ignora JSON inválido */
  }
  return fallback;
}

function parsePassos(raw: string | null | undefined, fallback: Passo[]): Passo[] {
  if (!raw) return fallback;
  try {
    const arr = JSON.parse(raw);
    if (
      Array.isArray(arr) &&
      arr.length > 0 &&
      arr.every(
        (x) =>
          x && typeof x.titulo === "string" && typeof x.texto === "string",
      )
    ) {
      return arr;
    }
  } catch {
    /* ignora JSON inválido */
  }
  return fallback;
}

export const getConfig = cache(async (): Promise<SiteConfig> => {
  let row: Awaited<ReturnType<typeof prisma.config.findUnique>> = null;
  let admin: {
    nome: string;
    creci: string | null;
    telefone: string | null;
    bio: string | null;
    avatarUrl: string | null;
  } | null = null;
  try {
    [row, admin] = await Promise.all([
      prisma.config.findUnique({ where: { id: CONFIG_SINGLETON_ID } }),
      // Identidade do site = admin PRINCIPAL (o primeiro/seed). Novos usuários
      // criados em /painel/painel-dev são apenas acessos e não mudam o site.
      prisma.admin.findFirst({
        select: {
          nome: true,
          creci: true,
          telefone: true,
          bio: true,
          avatarUrl: true,
        },
      }),
    ]);
  } catch {
    return CONFIG_PADRAO; // banco indisponível (ex.: build) → defaults
  }

  const merge = (valor: string | null | undefined, padrao: string) =>
    valor && valor.trim() ? valor : padrao;

  // Campos de identidade que também existem em "Meu perfil": precedência
  // Configurações > Perfil (admin) > default. Assim, o que o corretor edita
  // em qualquer um dos dois aparece no site.
  return {
    nome: merge(row?.nome ?? admin?.nome, CONFIG_PADRAO.nome),
    marca: merge(row?.marca, CONFIG_PADRAO.marca),
    subtitulo: merge(row?.subtitulo, CONFIG_PADRAO.subtitulo),
    assinatura: merge(row?.assinatura, CONFIG_PADRAO.assinatura),
    creci: merge(row?.creci ?? admin?.creci, CONFIG_PADRAO.creci),
    regiao: merge(row?.regiao, CONFIG_PADRAO.regiao),
    email: merge(row?.email, CONFIG_PADRAO.email),
    telefone: merge(row?.telefone ?? admin?.telefone, CONFIG_PADRAO.telefone),
    // WhatsApp cai para o telefone do perfil quando não definido em Configurações.
    whatsapp: merge(
      row?.whatsapp ?? admin?.telefone,
      CONFIG_PADRAO.whatsapp,
    ),
    instagram: merge(row?.instagram, CONFIG_PADRAO.instagram),
    endereco: merge(row?.endereco, CONFIG_PADRAO.endereco),
    // Foto do corretor: fonte única = avatar do admin (editável em Perfil e
    // em Configurações), com fallback para o retrato da marca.
    retratoUrl: merge(admin?.avatarUrl, CONFIG_PADRAO.retratoUrl),
    // Conteúdo editável
    heroEyebrow: merge(row?.heroEyebrow, CONFIG_PADRAO.heroEyebrow),
    heroTitulo: merge(row?.heroTitulo, CONFIG_PADRAO.heroTitulo),
    heroSubtitulo: merge(row?.heroSubtitulo, CONFIG_PADRAO.heroSubtitulo),
    heroImagens: parseUrls(row?.heroImagens, CONFIG_PADRAO.heroImagens),
    numeros: parseStats(row?.numeros, CONFIG_PADRAO.numeros),
    miniDestaques: parseStats(row?.miniDestaques, CONFIG_PADRAO.miniDestaques),
    sobreTitulo: merge(row?.sobreTitulo, CONFIG_PADRAO.sobreTitulo),
    sobreResumo: merge(row?.sobreResumo, CONFIG_PADRAO.sobreResumo),
    bio: merge(row?.bio, CONFIG_PADRAO.bio),
    passos: parsePassos(row?.passos, CONFIG_PADRAO.passos),
    ctaTitulo: merge(row?.ctaTitulo, CONFIG_PADRAO.ctaTitulo),
    ctaTexto: merge(row?.ctaTexto, CONFIG_PADRAO.ctaTexto),
  };
});

/**
 * Imagens de banner do hero cadastradas pelo corretor (sem fallback).
 * Vazio = nenhum banner configurado → o hero usa as fotos dos imóveis.
 */
export async function getHeroBanners(): Promise<string[]> {
  try {
    const row = await prisma.config.findUnique({
      where: { id: CONFIG_SINGLETON_ID },
      select: { heroImagens: true },
    });
    // Ignora os placeholders padrão da marca (/brand/...): não são banners que o
    // corretor adicionou de fato, então o hero deve cair para as fotos dos imóveis.
    return parseUrls(row?.heroImagens, []).filter(
      (u) => !u.startsWith("/brand/"),
    );
  } catch {
    return [];
  }
}
