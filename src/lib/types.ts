/**
 * Tipos compartilhados entre servidor e cliente.
 * Mantemos versões "serializáveis" (datas como string) para passar de Server
 * Components para Client Components sem erros de serialização.
 */

export type FotoDTO = {
  id: string;
  url: string;
  ordem: number;
  capa: boolean;
};

export type ImovelDTO = {
  id: string;
  slug: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  condominio: number | null;
  condominioNome: string | null;
  cidade: string;
  bairro: string | null;
  endereco: string | null;
  complementoPrivado: string | null; // PRIVADO — só preenchido nas consultas do painel
  lat: number | null;
  lng: number | null;
  suites: number;
  quartos: number;
  banheiros: number | null;
  areaPrivativa: number | null;
  areaTerreno: number | null;
  vagas: number;
  descricao: string;
  diferenciais: string[];
  videoUrl: string | null;
  fotos: FotoDTO[];
  destaque: boolean;
  publicado: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

/** Versão enxuta usada nos cartões de listagem. */
export type ImovelCardDTO = Pick<
  ImovelDTO,
  | "id"
  | "slug"
  | "titulo"
  | "tipo"
  | "finalidade"
  | "preco"
  | "cidade"
  | "bairro"
  | "condominioNome"
  | "suites"
  | "quartos"
  | "banheiros"
  | "areaPrivativa"
  | "vagas"
  | "destaque"
> & {
  capaUrl: string | null;
  lote: number; // "Lote NN" exibido sobre a foto
};

export type CondominioDTO = {
  id: string;
  nome: string;
  cidade: string | null;
  criadoEm: string;
};

export type LeadDTO = {
  id: string;
  nome: string;
  whatsapp: string;
  mensagem: string | null;
  imovelId: string | null;
  imovelTitulo: string | null;
  status: string;
  origem: string;
  lido: boolean;
  criadoEm: string;
};

export type FiltrosImovel = {
  cidade?: string;
  condominioNome?: string;
  tipo?: string;
  finalidade?: string;
  dormitorios?: number;
  precoMin?: number;
  precoMax?: number;
  ordenar?: OrdenacaoImovel;
  pagina?: number;
};

export type OrdenacaoImovel =
  | "recentes"
  | "preco_asc"
  | "preco_desc"
  | "area_desc";

export type AdminSession = {
  id: string;
  email: string;
  nome: string;
};
