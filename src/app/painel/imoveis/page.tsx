/**
 * Painel — Listagem de imóveis.
 * Mostra todos os imóveis (publicados e rascunhos) em tabela/cartões com ações.
 */

import { ImoveisTable } from "@/components/admin/ImoveisTable";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/ui/icons";
import { listarImoveisAdmin } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Imóveis · Painel",
};

export default async function PainelImoveisPage() {
  const imoveis = await listarImoveisAdmin();

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Gestão</span>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Imóveis
          </h1>
          <p className="mt-2 text-sm text-stone-d">
            {imoveis.length === 0
              ? "Nenhum imóvel no acervo."
              : `${imoveis.length} ${
                  imoveis.length === 1 ? "propriedade" : "propriedades"
                } no acervo.`}
          </p>
        </div>

        <Button href="/painel/imoveis/novo" variant="primary" size="md">
          <IconPlus className="h-4 w-4" />
          Novo imóvel
        </Button>
      </header>

      <ImoveisTable imoveis={imoveis} />
    </div>
  );
}
