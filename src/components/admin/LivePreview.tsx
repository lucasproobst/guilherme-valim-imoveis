"use client";

/**
 * Pré-visualização ao vivo: monta um ImovelCardDTO a partir do estado do
 * formulário e renderiza o mesmo PropertyCard usado no site público.
 * Mostra ao corretor exatamente como o imóvel aparecerá na vitrine.
 */

import { PropertyCard } from "@/components/site/PropertyCard";
import type { ImovelCardDTO } from "@/lib/types";

export function LivePreview({
  titulo,
  tipo,
  finalidade,
  preco,
  cidade,
  bairro,
  suites,
  banheiros,
  areaPrivativa,
  vagas,
  destaque,
  capaUrl,
}: {
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  cidade: string;
  bairro: string;
  suites: number;
  banheiros: number | null;
  areaPrivativa: number | null;
  vagas: number;
  destaque: boolean;
  capaUrl: string | null;
}) {
  const imovel: ImovelCardDTO = {
    id: "preview",
    slug: "#",
    titulo: titulo.trim() || "Título do imóvel",
    tipo,
    finalidade,
    preco,
    cidade: cidade.trim() || "Cidade",
    bairro: bairro.trim() || null,
    suites,
    banheiros,
    areaPrivativa,
    vagas,
    destaque,
    capaUrl,
    lote: 7,
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="eyebrow">Pré-visualização</span>
      {/* pointer-events-none para que os links do card não naveguem no painel */}
      <div className="pointer-events-none">
        <PropertyCard imovel={imovel} />
      </div>
      <p className="text-xs leading-relaxed text-stone">
        Assim o imóvel aparecerá nos cartões do site.
      </p>
    </div>
  );
}
