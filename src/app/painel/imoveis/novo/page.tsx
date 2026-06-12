/**
 * Painel — Novo imóvel.
 * Página de cadastro: breadcrumb + título + formulário completo (ImovelForm).
 */

import Link from "next/link";
import { exigirAdmin } from "@/lib/auth";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rule } from "@/components/ui/Rule";
import { IconChevronLeft } from "@/components/ui/icons";
import { ImovelForm } from "@/components/admin/ImovelForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Novo imóvel · Painel",
};

export default async function NovoImovelPage() {
  await exigirAdmin();

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
        <span className="label text-[0.62rem] tracking-label text-stone">
          Novo
        </span>
      </nav>

      {/* Cabeçalho */}
      <header className="flex flex-col gap-3">
        <Eyebrow>Cadastro</Eyebrow>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Novo imóvel
        </h1>
        <Rule brass />
        <p className="max-w-prose text-sm leading-relaxed text-stone-d">
          Componha uma nova peça do portfólio. Comece pelas fotos — elas são as
          protagonistas — e acompanhe a pré-visualização ao lado.
        </p>
      </header>

      <ImovelForm />
    </div>
  );
}
