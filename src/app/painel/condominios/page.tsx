/**
 * Painel — Condomínios.
 * CRUD da lista de condomínios/empreendimentos usada no cadastro e no filtro.
 */

import { exigirAdmin } from "@/lib/auth";
import { listarCondominios } from "@/lib/queries";
import { CondominiosManager } from "@/components/admin/CondominiosManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Condomínios · Painel",
};

export default async function PainelCondominiosPage() {
  await exigirAdmin();
  const condominios = await listarCondominios();

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <span className="eyebrow">Gestão</span>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          Condomínios
        </h1>
        <p className="mt-1 text-sm text-stone-d">
          Gerencie os condomínios e empreendimentos. Eles aparecem como sugestão
          no cadastro de imóveis e no filtro do site.
        </p>
      </header>

      <CondominiosManager condominios={condominios} />
    </div>
  );
}
