/**
 * Painel — Meu perfil.
 * Exibe o cartão de identidade do corretor e o formulário de edição
 * (dados cadastrais + troca de senha).
 */

import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconMail, IconPhone } from "@/components/ui/icons";
import { PerfilForm } from "@/components/admin/PerfilForm";
import { exigirAdmin } from "@/lib/auth";
import { IMAGENS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meu perfil · Painel",
};

export default async function PainelPerfilPage() {
  const sessao = await exigirAdmin();
  const admin = await prisma.admin.findUnique({ where: { id: sessao.id } });

  // Caso raro: sessão válida mas registro removido — fallback aos dados da sessão.
  const nome = admin?.nome ?? sessao.nome;
  const email = admin?.email ?? sessao.email;
  const creci = admin?.creci ?? "";
  const telefone = admin?.telefone ?? "";
  const bio = admin?.bio ?? "";
  const avatarUrl = admin?.avatarUrl ?? null;
  const avatar = avatarUrl ?? IMAGENS.retrato;

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <header>
        <span className="eyebrow">Conta</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Meu perfil
        </h1>
        <p className="mt-2 text-sm text-stone-d">
          Atualize suas informações e a senha de acesso ao painel.
        </p>
      </header>

      {/* Cartão de identidade */}
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-8 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-line bg-bone-2">
            <Image
              src={avatar}
              alt={`Retrato de ${nome}`}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <Eyebrow>{creci || "Corretor"}</Eyebrow>
            <h2 className="mt-2 font-display text-2xl text-ink">{nome}</h2>

            <div className="mt-3 flex flex-col gap-1.5 text-sm text-stone-d">
              <span className="flex items-center gap-2">
                <IconMail className="h-4 w-4 shrink-0 text-brass" />
                {email}
              </span>
              {telefone && (
                <span className="flex items-center gap-2">
                  <IconPhone className="h-4 w-4 shrink-0 text-brass" />
                  {telefone}
                </span>
              )}
            </div>

            {bio && (
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-stone-d">
                {bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de edição (dados + senha) */}
      <PerfilForm
        inicial={{ nome, email, creci, telefone, bio, avatarUrl }}
        avatarFallback={IMAGENS.retrato}
      />
    </div>
  );
}
