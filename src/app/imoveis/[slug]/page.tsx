import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getImovelBySlug,
  getImoveisRelacionados,
  loteFromId,
} from "@/lib/queries";
import { formatPreco } from "@/lib/format";

import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { VideoFrame } from "@/components/ui/VideoFrame";
import { IconChevronRight } from "@/components/ui/icons";

import { Gallery } from "@/components/site/Gallery";
import { SpecsBar } from "@/components/site/SpecsBar";
import { DiferenciaisList } from "@/components/site/DiferenciaisList";
import { MapEmbed } from "@/components/site/MapEmbed";
import { ContactCard } from "@/components/site/ContactCard";

// A página consulta o banco — renderização sempre dinâmica.
export const dynamic = "force-dynamic";

/** Recorta a descrição para uma meta description de ~155 caracteres. */
function trecho(texto: string, limite = 155): string {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (limpo.length <= limite) return limpo;
  return `${limpo.slice(0, limite - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const imovel = await getImovelBySlug(params.slug);
  if (!imovel) {
    return { title: "Imóvel não encontrado" };
  }

  const descricao = trecho(imovel.descricao);
  const primeiraFoto = imovel.fotos[0]?.url;

  return {
    title: imovel.titulo,
    description: descricao,
    openGraph: {
      title: imovel.titulo,
      description: descricao,
      images: primeiraFoto ? [primeiraFoto] : undefined,
    },
  };
}

export default async function ImovelPage({
  params,
}: {
  params: { slug: string };
}) {
  const imovel = await getImovelBySlug(params.slug);
  if (!imovel) notFound();

  const lote = loteFromId(imovel.id);
  const relacionados = await getImoveisRelacionados(imovel, 3);

  const local = [imovel.cidade, imovel.bairro].filter(Boolean).join(" · ");
  const ehLocacao = imovel.finalidade === "Locação";

  return (
    <SiteShell>
      <article className="pb-24 pt-10 sm:pt-14">
        <div className="shell">
          {/* Breadcrumb */}
          <nav aria-label="Trilha de navegação" className="mb-8">
            <ol className="label flex flex-wrap items-center gap-2 text-[0.62rem] tracking-label text-stone">
              <li>
                <Link href="/" className="transition-colors hover:text-brass">
                  Início
                </Link>
              </li>
              <IconChevronRight className="h-3.5 w-3.5 text-stone/60" aria-hidden />
              <li>
                <Link
                  href="/imoveis"
                  className="transition-colors hover:text-brass"
                >
                  Imóveis
                </Link>
              </li>
              <IconChevronRight className="h-3.5 w-3.5 text-stone/60" aria-hidden />
              <li className="truncate text-stone-d" aria-current="page">
                {imovel.titulo}
              </li>
            </ol>
          </nav>

          {/* Cabeçalho */}
          <header className="mb-9 flex flex-col gap-4">
            <Eyebrow>{local}</Eyebrow>
            <h1 className="max-w-4xl font-display text-4xl leading-[1.08] text-ink sm:text-5xl md:text-[3.4rem]">
              {imovel.titulo}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="font-display text-2xl text-ink sm:text-3xl">
                {formatPreco(imovel.preco)}
                {ehLocacao && (
                  <span className="text-base text-stone"> /mês</span>
                )}
              </p>
              <span className="flex flex-wrap items-center gap-2">
                <Badge tom="bone">{imovel.tipo}</Badge>
                <Badge tom="ink">{imovel.finalidade}</Badge>
              </span>
            </div>
          </header>

          {/* Galeria */}
          <Gallery fotos={imovel.fotos} titulo={imovel.titulo} lote={lote} />

          {/* Faixa de especificações */}
          <div className="reveal mt-7">
            <SpecsBar imovel={imovel} />
          </div>

          {/* Conteúdo principal em duas colunas */}
          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            {/* Coluna esquerda — narrativa do imóvel */}
            <div className="flex flex-col gap-16">
              <section className="reveal flex flex-col gap-7">
                <SectionHeading
                  eyebrow="Apresentação"
                  titulo="Sobre o imóvel"
                />
                <div className="max-w-prose space-y-5 leading-relaxed text-stone-d">
                  {imovel.descricao
                    .split(/\n{2,}|\n/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((paragrafo, idx) => (
                      <p key={idx}>{paragrafo}</p>
                    ))}
                </div>
              </section>

              {imovel.videoUrl && (
                <section className="reveal flex flex-col gap-7">
                  <SectionHeading eyebrow="Tour" titulo="Vídeo do imóvel" />
                  <VideoFrame
                    src={imovel.videoUrl}
                    poster={
                      imovel.fotos.find((f) => f.capa)?.url ??
                      imovel.fotos[0]?.url
                    }
                  />
                </section>
              )}

              <div className="reveal">
                <DiferenciaisList itens={imovel.diferenciais} />
              </div>

              <div className="reveal">
                <MapEmbed imovel={imovel} />
              </div>
            </div>

            {/* Coluna direita — cartão de contato fixo */}
            <aside className="reveal reveal-right lg:sticky lg:top-28 lg:self-start">
              <ContactCard imovel={imovel} />
            </aside>
          </div>
        </div>

        {/* Imóveis semelhantes */}
        {relacionados.length > 0 && (
          <section className="mt-24 border-t border-line pt-20">
            <div className="shell">
              <SectionHeading
                eyebrow="Continue explorando"
                titulo="Imóveis semelhantes"
              />
              <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((rel, i) => (
                  <div
                    key={rel.id}
                    className="reveal"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    <PropertyCard imovel={rel} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </SiteShell>
  );
}
