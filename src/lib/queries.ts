import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { POR_PAGINA } from "@/lib/constants";
import type {
  CondominioDTO,
  FiltrosImovel,
  ImovelCardDTO,
  ImovelDTO,
  LeadDTO,
  OrdenacaoImovel,
} from "@/lib/types";

/* ------------------------------------------------------------------ *
 *  Helpers de mapeamento (Prisma -> DTO serializável)
 * ------------------------------------------------------------------ */

const imovelComFotos = {
  include: { fotos: { orderBy: { ordem: "asc" } } },
} satisfies Prisma.ImovelDefaultArgs;

type ImovelComFotos = Prisma.ImovelGetPayload<typeof imovelComFotos>;

/** Número decorativo de "Lote", estável e derivado do id. */
export function loteFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (h % 60) + 1; // 1..60
}

function parseDiferenciais(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function toImovelDTO(i: ImovelComFotos): ImovelDTO {
  return {
    id: i.id,
    slug: i.slug,
    titulo: i.titulo,
    tipo: i.tipo,
    finalidade: i.finalidade,
    preco: i.preco,
    condominio: i.condominio,
    condominioNome: i.condominioNome,
    cidade: i.cidade,
    bairro: i.bairro,
    endereco: i.endereco,
    complementoPrivado: i.complementoPrivado,
    lat: i.lat,
    lng: i.lng,
    suites: i.suites,
    quartos: i.quartos,
    banheiros: i.banheiros,
    areaPrivativa: i.areaPrivativa,
    areaTerreno: i.areaTerreno,
    vagas: i.vagas,
    descricao: i.descricao,
    diferenciais: parseDiferenciais(i.diferenciais),
    videoUrl: i.videoUrl,
    fotos: i.fotos.map((f) => ({
      id: f.id,
      url: f.url,
      ordem: f.ordem,
      capa: f.capa,
    })),
    destaque: i.destaque,
    publicado: i.publicado,
    criadoEm: i.criadoEm.toISOString(),
    atualizadoEm: i.atualizadoEm.toISOString(),
  };
}

function toCardDTO(i: ImovelComFotos): ImovelCardDTO {
  const capa = i.fotos.find((f) => f.capa) ?? i.fotos[0] ?? null;
  return {
    id: i.id,
    slug: i.slug,
    titulo: i.titulo,
    tipo: i.tipo,
    finalidade: i.finalidade,
    preco: i.preco,
    cidade: i.cidade,
    bairro: i.bairro,
    condominioNome: i.condominioNome,
    suites: i.suites,
    quartos: i.quartos,
    banheiros: i.banheiros,
    areaPrivativa: i.areaPrivativa,
    vagas: i.vagas,
    destaque: i.destaque,
    capaUrl: capa?.url ?? null,
    lote: loteFromId(i.id),
  };
}

/* ------------------------------------------------------------------ *
 *  Consultas públicas (site)
 * ------------------------------------------------------------------ */

/** Imóveis em destaque para a "Seleção da semana" da home. */
export async function getImoveisDestaque(limit = 3): Promise<ImovelCardDTO[]> {
  const itens = await prisma.imovel.findMany({
    where: { publicado: true, destaque: true },
    orderBy: { criadoEm: "desc" },
    take: limit,
    ...imovelComFotos,
  });
  // Se não houver destaques suficientes, completa com os mais recentes.
  if (itens.length < limit) {
    const extras = await prisma.imovel.findMany({
      where: { publicado: true, id: { notIn: itens.map((i) => i.id) } },
      orderBy: { criadoEm: "desc" },
      take: limit - itens.length,
      ...imovelComFotos,
    });
    itens.push(...extras);
  }
  return itens.map(toCardDTO);
}

/**
 * Uma foto (a capa) de cada imóvel publicado — usada como banner rotativo do
 * hero quando o corretor ainda não cadastrou imagens de banner próprias.
 * Prioriza destaques e os mais recentes; uma imagem por imóvel.
 */
export async function getFotosCapaImoveis(limit = 8): Promise<string[]> {
  const itens = await prisma.imovel.findMany({
    where: { publicado: true },
    orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
    take: limit,
    select: {
      fotos: {
        orderBy: [{ capa: "desc" }, { ordem: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
  });
  return itens
    .map((i) => i.fotos[0]?.url)
    .filter((u): u is string => Boolean(u));
}

function orderByDe(ordenar?: OrdenacaoImovel): Prisma.ImovelOrderByWithRelationInput {
  switch (ordenar) {
    case "preco_asc":
      return { preco: "asc" };
    case "preco_desc":
      return { preco: "desc" };
    case "area_desc":
      return { areaPrivativa: "desc" };
    default:
      return { criadoEm: "desc" };
  }
}

export type ResultadoBusca = {
  itens: ImovelCardDTO[];
  total: number;
  pagina: number;
  totalPaginas: number;
};

/** Lista paginada e filtrada de imóveis publicados (página /imoveis). */
export async function buscarImoveis(
  filtros: FiltrosImovel,
): Promise<ResultadoBusca> {
  const where: Prisma.ImovelWhereInput = { publicado: true };

  if (filtros.cidade) where.cidade = filtros.cidade;
  if (filtros.condominioNome) where.condominioNome = filtros.condominioNome;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.finalidade) where.finalidade = filtros.finalidade;
  if (filtros.dormitorios) where.suites = { gte: filtros.dormitorios };
  if (filtros.precoMin || filtros.precoMax) {
    where.preco = {};
    if (filtros.precoMin) where.preco.gte = filtros.precoMin;
    if (filtros.precoMax) where.preco.lte = filtros.precoMax;
  }

  const pagina = Math.max(1, filtros.pagina ?? 1);

  const [total, itens] = await Promise.all([
    prisma.imovel.count({ where }),
    prisma.imovel.findMany({
      where,
      orderBy: orderByDe(filtros.ordenar),
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      ...imovelComFotos,
    }),
  ]);

  return {
    itens: itens.map(toCardDTO),
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
  };
}

/** Detalhe de um imóvel publicado pelo slug. */
export async function getImovelBySlug(slug: string): Promise<ImovelDTO | null> {
  const i = await prisma.imovel.findFirst({
    where: { slug, publicado: true },
    ...imovelComFotos,
  });
  if (!i) return null;
  // O complemento é PRIVADO: nunca sai para o site público (só no painel).
  return { ...toImovelDTO(i), complementoPrivado: null };
}

/** Imóveis semelhantes (mesma cidade ou tipo), exceto o atual. */
export async function getImoveisRelacionados(
  imovel: ImovelDTO,
  limit = 3,
): Promise<ImovelCardDTO[]> {
  const itens = await prisma.imovel.findMany({
    where: {
      publicado: true,
      id: { not: imovel.id },
      OR: [{ cidade: imovel.cidade }, { tipo: imovel.tipo }],
    },
    orderBy: { criadoEm: "desc" },
    take: limit,
    ...imovelComFotos,
  });
  return itens.map(toCardDTO);
}

/** Cidades distintas com imóveis publicados (para o filtro). */
export async function getCidadesDisponiveis(): Promise<string[]> {
  const linhas = await prisma.imovel.findMany({
    where: { publicado: true },
    distinct: ["cidade"],
    select: { cidade: true },
    orderBy: { cidade: "asc" },
  });
  return linhas.map((l) => l.cidade);
}

/** Condomínios distintos com imóveis publicados (para o filtro). */
export async function getCondominiosDisponiveis(): Promise<string[]> {
  const linhas = await prisma.imovel.findMany({
    where: { publicado: true, condominioNome: { not: null } },
    distinct: ["condominioNome"],
    select: { condominioNome: true },
    orderBy: { condominioNome: "asc" },
  });
  return linhas
    .map((l) => l.condominioNome)
    .filter((c): c is string => Boolean(c && c.trim()));
}

/** Condomínios cadastrados (gerenciados no painel). */
export async function listarCondominios(): Promise<CondominioDTO[]> {
  const linhas = await prisma.condominio.findMany({
    orderBy: { nome: "asc" },
  });
  return linhas.map((c) => ({
    id: c.id,
    nome: c.nome,
    cidade: c.cidade,
    criadoEm: c.criadoEm.toISOString(),
  }));
}

/** Apenas os nomes dos condomínios cadastrados (para a lista do cadastro). */
export async function getNomesCondominios(): Promise<string[]> {
  const linhas = await prisma.condominio.findMany({
    orderBy: { nome: "asc" },
    select: { nome: true },
  });
  return linhas.map((c) => c.nome);
}

/** Slugs publicados para o sitemap. */
export async function getSlugsPublicados(): Promise<
  { slug: string; atualizadoEm: string }[]
> {
  const itens = await prisma.imovel.findMany({
    where: { publicado: true },
    select: { slug: true, atualizadoEm: true },
  });
  return itens.map((i) => ({
    slug: i.slug,
    atualizadoEm: i.atualizadoEm.toISOString(),
  }));
}

/* ------------------------------------------------------------------ *
 *  Consultas do painel (admin)
 * ------------------------------------------------------------------ */

/** Todos os imóveis (publicados e rascunhos) para a tabela do painel. */
export async function listarImoveisAdmin(): Promise<ImovelDTO[]> {
  const itens = await prisma.imovel.findMany({
    orderBy: { atualizadoEm: "desc" },
    ...imovelComFotos,
  });
  return itens.map(toImovelDTO);
}

/** Imóvel por id (para edição no painel). */
export async function getImovelById(id: string): Promise<ImovelDTO | null> {
  const i = await prisma.imovel.findUnique({ where: { id }, ...imovelComFotos });
  return i ? toImovelDTO(i) : null;
}

/** Totais para os cards da visão geral do painel. */
export async function getResumoPainel() {
  const [publicados, rascunhos, leadsNovos, leadsTotal] = await Promise.all([
    prisma.imovel.count({ where: { publicado: true } }),
    prisma.imovel.count({ where: { publicado: false } }),
    prisma.lead.count({ where: { lido: false } }),
    prisma.lead.count(),
  ]);
  return { publicados, rascunhos, leadsNovos, leadsTotal };
}

/** Lista de leads (contatos recebidos) para o painel. */
export async function listarLeads(): Promise<LeadDTO[]> {
  const leads = await prisma.lead.findMany({
    orderBy: { criadoEm: "desc" },
    include: { imovel: { select: { titulo: true } } },
  });
  return leads.map((l) => ({
    id: l.id,
    nome: l.nome,
    whatsapp: l.whatsapp,
    mensagem: l.mensagem,
    imovelId: l.imovelId,
    imovelTitulo: l.imovel?.titulo ?? null,
    status: l.status,
    origem: l.origem,
    lido: l.lido,
    criadoEm: l.criadoEm.toISOString(),
  }));
}
