/**
 * Painel — Painel Dev (usuários & acessos).
 * Cria contas de acesso ao painel, troca senhas e remove usuários, para que as
 * credenciais não fiquem presas ao código/seed.
 */

import { exigirAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  UsuariosManager,
  type Usuario,
} from "@/components/admin/UsuariosManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel Dev · Usuários",
};

export default async function PainelDevPage() {
  const sessao = await exigirAdmin();

  const usuarios: Usuario[] = await prisma.admin.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true },
  });

  return (
    <div className="space-y-10">
      <header>
        <span className="eyebrow">Sistema</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Painel Dev
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-d">
          Gerencie quem acessa o painel. Crie novos usuários e troque senhas
          quando precisar — todos entram pela página{" "}
          <span className="font-medium text-ink">/login</span> com o e-mail e a
          senha definidos aqui.
        </p>
      </header>

      <UsuariosManager usuarios={usuarios} currentId={sessao.id} />
    </div>
  );
}
