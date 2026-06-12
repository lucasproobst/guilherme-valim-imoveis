import type { ReactNode } from "react";
import { exigirAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

/**
 * Estrutura do painel do corretor.
 * `exigirAdmin()` valida a sessão (redireciona para /login se não houver).
 * Layout em duas colunas: navegação lateral fixa + área de conteúdo.
 */
export default async function PainelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessao = await exigirAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-bone lg:flex-row">
      <Sidebar sessao={sessao} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
