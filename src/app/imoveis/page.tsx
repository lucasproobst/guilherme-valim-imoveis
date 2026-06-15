import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { PropertyCard } from "@/components/site/PropertyCard";
import { FilterBar } from "@/components/site/FilterBar";
import type { ValoresFiltro } from "@/components/site/FilterBar";
import { Pagination } from "@/components/site/Pagination";
import { Button } from "@/components/ui/Button";
import { IconSearch } from "@/components/ui/icons";
import {
  buscarImoveis,
  getCidadesDisponiveis,
  getCondominiosDisponiveis,
} from "@/lib/queries";
import {
  TIPOS_IMOVEL,
  FINALIDADES,
  ORDENACOES,
} from "@/lib/constants";
import type {
  FiltrosImovel,
  OrdenacaoImovel,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Imóveis selecionados",
  description:
    "Portfólio de imóveis de alto padrão no Litoral Norte do Rio Grande do Sul. Casas, coberturas e terrenos selecionados por Guilherme Valim.",
};

/** Converte string de searchParam em inteiro positivo válido (ou undefined). */
function paraInteiro(valor: string | string[] | undefined): number | undefined {
  if (typeof valor !== "string" || valor.trim() === "") return undefined;
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

/** Lê uma string simples do searchParam (primeiro valor, se array). */
function paraTexto(valor: string | string[] | undefined): string | undefined {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v && v.trim() !== "" ? v : undefined;
}

const ORDENACOES_VALIDAS: OrdenacaoImovel[] = [
  "recentes",
  "preco_asc",
  "preco_desc",
  "area_desc",
];

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // ----- Leitura e validação dos parâmetros de busca -----
  const cidade = paraTexto(searchParams.cidade);
  const condominioNome = paraTexto(searchParams.condominioNome);
  const tipo = paraTexto(searchParams.tipo);
  const finalidade = paraTexto(searchParams.finalidade);
  const dormitorios = paraInteiro(searchParams.dormitorios);
  const precoMin = paraInteiro(searchParams.precoMin);
  const precoMax = paraInteiro(searchParams.precoMax);
  const pagina = paraInteiro(searchParams.pagina) ?? 1;

  const ordenarBruto = paraTexto(searchParams.ordenar);
  const ordenar: OrdenacaoImovel = ORDENACOES_VALIDAS.includes(
    ordenarBruto as OrdenacaoImovel,
  )
    ? (ordenarBruto as OrdenacaoImovel)
    : "recentes";

  const filtros: FiltrosImovel = {
    cidade,
    condominioNome,
    tipo,
    finalidade,
    dormitorios,
    precoMin,
    precoMax,
    ordenar,
    pagina,
  };

  // ----- Consultas ao banco -----
  const [resultado, cidades, condominios] = await Promise.all([
    buscarImoveis(filtros),
    getCidadesDisponiveis(),
    getCondominiosDisponiveis(),
  ]);

  const { itens, total, totalPaginas } = resultado;

  // Valores enviados à barra de filtros (somente o que está aplicado na URL)
  const valores: ValoresFiltro = {
    cidade,
    condominioNome,
    tipo,
    finalidade,
    dormitorios: dormitorios ? String(dormitorios) : undefined,
    precoMin: precoMin ? String(precoMin) : undefined,
    precoMax: precoMax ? String(precoMax) : undefined,
    ordenar,
  };

  const contagem =
    total === 0
      ? "Nenhum imóvel disponível"
      : `${total} ${total === 1 ? "imóvel disponível" : "imóveis disponíveis"}`;

  return (
    <SiteShell>
      {/* Topo de página — fundo creme, muito respiro */}
      <section className="bg-bone">
        <div className="shell py-14 md:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Trilha de navegação" className="mb-8">
            <ol className="label flex items-center gap-2 text-[0.62rem] tracking-label text-stone">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-ink"
                >
                  Início
                </Link>
              </li>
              <li aria-hidden className="text-stone/50">
                /
              </li>
              <li className="text-ink" aria-current="page">
                Imóveis
              </li>
            </ol>
          </nav>

          <p className="eyebrow">Portfólio</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.08] text-ink sm:text-5xl md:text-[3.4rem]">
            Imóveis <span className="accent-italic">selecionados</span>
          </h1>
          <p className="mt-5 text-sm text-stone-d">{contagem}</p>
        </div>
      </section>

      {/* Barra de filtros */}
      <FilterBar
        cidades={cidades}
        condominios={condominios}
        tipos={TIPOS_IMOVEL}
        finalidades={FINALIDADES}
        ordenacoes={ORDENACOES}
        valores={valores}
      />

      {/* Resultados */}
      <section className="bg-bone">
        <div className="shell py-14 md:py-20">
          {itens.length === 0 ? (
            // Estado vazio elegante
            <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line text-brass">
                <IconSearch className="h-7 w-7" />
              </span>
              <h2 className="mt-8 font-display text-2xl text-ink">
                Nenhum imóvel encontrado
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-d">
                Não localizamos imóveis com os filtros escolhidos. Ajuste os
                critérios ou explore o portfólio completo.
              </p>
              <Button href="/imoveis" variant="ghost" size="md" className="mt-8">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12">
                {itens.map((imovel, i) => (
                  <li
                    key={imovel.id}
                    className="reveal"
                    style={{ transitionDelay: `${(i % 3) * 80}ms` }}
                  >
                    <PropertyCard imovel={imovel} priority={i < 3} />
                  </li>
                ))}
              </ul>

              <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                searchParams={searchParams}
              />
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
