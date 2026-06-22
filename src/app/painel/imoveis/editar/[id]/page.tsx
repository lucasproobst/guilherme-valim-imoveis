/**
 * Painel — Editar imóvel.
 * Carrega o imóvel por id (404 se não existir) e reaproveita o ImovelForm.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/lib/auth";
import { getImovelById, getNomesCondominios } from "@/lib/queries";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rule } from "@/components/ui/Rule";
import { IconChevronLeft } from "@/components/ui/icons";
import { ImovelForm } from "@/components/admin/ImovelForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editar imóvel · Painel",
};

export default async function EditarImovelPage({
  params,
}: {
  params: { id: string };
}) {
  await exigirAdmin();

  const [imovel, condominios] = await Promise.all([
    getImovelById(params.id),
    getNomesCondominios(),
  ]);
  if (!imovel) notFound();

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Navegação" className="flex items-center gap-2">
        <Link
          href="/painel/imoveis"
          className="label inline-flex items-center gap-1.5 text-[0.62rem] tracking-label text-stone-d transition-colors hover:text-brass"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          Imóveis
        </Link>
        <span className="text-stone">/</span>
        <span className="label max-w-[14rem] truncate text-[0.62rem] tracking-label text-stone">
          {imovel.titulo}
        </span>
      </nav>

      {/* Cabeçalho */}
      <header className="flex flex-col gap-3">
        <Eyebrow>Edição</Eyebrow>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Editar imóvel
        </h1>
        <Rule brass />
        <p className="max-w-prose text-sm leading-relaxed text-stone-d">
          Ajuste as informações e as fotos. As alterações entram no ar assim que
          você salvar.
        </p>
      </header>

      <ImovelForm imovel={imovel} condominios={condominios} />
    </div>
  );
}
