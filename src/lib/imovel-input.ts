/**
 * Saneamento/validação do corpo (ImovelInput) enviado pelo formulário do
 * painel. Compartilhado entre POST /api/imoveis e PUT /api/imoveis/[id].
 */

export type FotoInput = { url: string; ordem: number; capa: boolean };

export type ImovelInput = {
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  condominio: number | null;
  condominioNome: string;
  cidade: string;
  bairro: string;
  endereco: string;
  complementoPrivado: string;
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
  destaque: boolean;
  publicado: boolean;
  fotos: FotoInput[];
  videoUrl: string | null;
};

/** Saneia e valida o corpo recebido. Lança Error com mensagem amigável. */
export function parseImovelInput(body: unknown): ImovelInput {
  const d = (body ?? {}) as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const num = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : 0;
  const numOuNulo = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const bool = (v: unknown) => v === true;

  const titulo = str(d.titulo);
  const cidade = str(d.cidade);
  const preco = num(d.preco);

  if (titulo.length < 2) throw new Error("Informe o título do imóvel.");
  if (cidade.length < 2) throw new Error("Informe a cidade.");
  if (preco <= 0) throw new Error("Informe um preço válido.");

  const diferenciais = Array.isArray(d.diferenciais)
    ? d.diferenciais.filter((x): x is string => typeof x === "string")
    : [];

  const fotosRaw = Array.isArray(d.fotos) ? d.fotos : [];
  const fotos: FotoInput[] = fotosRaw
    .map((f, i) => {
      const o = (f ?? {}) as Record<string, unknown>;
      return {
        url: typeof o.url === "string" ? o.url : "",
        ordem: typeof o.ordem === "number" ? o.ordem : i,
        capa: o.capa === true,
      };
    })
    .filter((f) => f.url.length > 0);

  return {
    titulo,
    tipo: str(d.tipo) || "Casa",
    finalidade: str(d.finalidade) || "Venda",
    preco,
    condominio: numOuNulo(d.condominio),
    condominioNome: str(d.condominioNome),
    cidade,
    bairro: str(d.bairro),
    endereco: str(d.endereco),
    complementoPrivado: str(d.complementoPrivado),
    lat: numOuNulo(d.lat),
    lng: numOuNulo(d.lng),
    suites: num(d.suites),
    quartos: num(d.quartos),
    banheiros: numOuNulo(d.banheiros),
    areaPrivativa: numOuNulo(d.areaPrivativa),
    areaTerreno: numOuNulo(d.areaTerreno),
    vagas: num(d.vagas),
    descricao: str(d.descricao),
    diferenciais,
    destaque: bool(d.destaque),
    publicado: bool(d.publicado),
    fotos,
    videoUrl: str(d.videoUrl) || null,
  };
}
