/**
 * Constantes de conteúdo e de domínio do site.
 * Centralizar aqui facilita trocar dados do corretor sem caçar pelo código.
 */

/** Dados do corretor exibidos no site (rodapé, sobre, contato, cards). */
export const CORRETOR = {
  nome: "Guilherme Valim",
  marca: "Guilherme Valim",
  subtitulo: "Imóveis de Alto Padrão",
  creci: "CRECI 00000-F",
  regiao: "Litoral Norte · Rio Grande do Sul",
  email: "contato@guilhermevalim.com.br",
  // telefone visível (formatado) e whatsapp (somente dígitos, com DDI)
  telefone: "(51) 99999-0000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5551999990000",
  instagram: "@guilhermevalim.imoveis",
  endereco: "Av. Beira Mar, 1200 — Capão da Canoa/RS",
  assinatura: "Guilherme Valim",
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Imagens de identidade da marca (geradas em /public/brand por
 * `npm run gen:imagens`). Use estes caminhos nas páginas em vez de hardcode.
 */
export const IMAGENS = {
  hero: "/brand/hero.svg",
  retrato: "/brand/retrato.svg",
  sobre: "/brand/sobre.svg",
  contato: "/brand/contato.svg",
  cta: "/brand/cta.svg",
} as const;

/** Itens do menu principal (header público). */
export const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

/** Tipos de imóvel disponíveis no cadastro e nos filtros. */
export const TIPOS_IMOVEL = [
  "Casa",
  "Apartamento",
  "Cobertura",
  "Terreno",
  "Sobrado",
  "Sítio",
] as const;

export const FINALIDADES = ["Venda", "Locação"] as const;

/**
 * Condomínios/empreendimentos de alto padrão (Capão da Canoa / Xangri-lá).
 * Lista inicial sugerida no cadastro e no filtro — o corretor pode digitar
 * qualquer outro nome livremente.
 */
export const CONDOMINIOS = [
  "Velas da Marina",
  "Sense",
  "Capão Ilhas Resort",
  "Ilhas Park",
  "Quintas do Lago",
  "Ventura",
  "Enseada",
  "Marina Park",
  "Reserva da Marina",
  "Dunas Residence",
] as const;

/** Chips de diferenciais selecionáveis no painel. */
export const DIFERENCIAIS = [
  "Piscina",
  "Automação",
  "Energia solar",
  "Elevador",
  "Espaço gourmet",
  "Academia",
  "Vista mar",
  "Frente para o mar",
  "Churrasqueira",
  "Closet",
  "Lareira",
  "Jardim",
  "Sistema de segurança",
  "Adega",
  "Home theater",
  "Hidromassagem",
  "Cozinha gourmet",
  "Varanda integrada",
] as const;

/** Opções de ordenação na página de imóveis. */
export const ORDENACOES = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
  { value: "area_desc", label: "Maior área" },
] as const;

export const POR_PAGINA = 9;

/** Status possíveis de um lead (painel). */
export const STATUS_LEAD = [
  { value: "novo", label: "Novo" },
  { value: "em_contato", label: "Em contato" },
  { value: "atendido", label: "Atendido" },
  { value: "arquivado", label: "Arquivado" },
] as const;
