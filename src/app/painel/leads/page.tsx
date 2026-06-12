/**
 * Painel — Leads e contatos.
 * Lista todos os contatos recebidos pelo site e pelas páginas de imóveis.
 */

import { LeadsList } from "@/components/admin/LeadsList";
import { listarLeads } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leads & contatos · Painel",
};

export default async function PainelLeadsPage() {
  const leads = await listarLeads();
  const naoLidos = leads.filter((l) => !l.lido).length;

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <header>
        <span className="eyebrow">Relacionamento</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Leads &amp; contatos
        </h1>
        <p className="mt-2 text-sm text-stone-d">
          {naoLidos > 0
            ? `${naoLidos} ${
                naoLidos === 1 ? "contato não lido" : "contatos não lidos"
              } · ${leads.length} no total.`
            : `${leads.length} ${
                leads.length === 1 ? "contato" : "contatos"
              } recebidos.`}
        </p>
      </header>

      <LeadsList leads={leads} />
    </div>
  );
}
