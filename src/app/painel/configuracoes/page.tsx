/**
 * Painel — Configurações do site.
 * Edita identidade + contato do corretor; as alterações refletem no site inteiro.
 */

import { ConfiguracoesForm } from "@/components/admin/ConfiguracoesForm";
import { exigirAdmin } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurações · Painel",
};

export default async function PainelConfiguracoesPage() {
  await exigirAdmin();
  const config = await getConfig();

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <header>
        <span className="eyebrow">Site</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Configurações
        </h1>
        <p className="mt-2 text-sm text-stone-d">
          Edite a identidade e os contatos do site. As alterações refletem
          imediatamente nas páginas públicas.
        </p>
      </header>

      {/* Formulário editável (identidade + contato) */}
      <ConfiguracoesForm inicial={config} />
    </div>
  );
}
