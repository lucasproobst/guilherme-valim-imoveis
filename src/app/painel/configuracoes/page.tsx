/**
 * Painel — Configurações do site.
 * Edita identidade + contato (refletem no site inteiro) e mostra cartões
 * informativos sobre a infraestrutura.
 */

import type { ReactNode } from "react";
import { IconHome, IconSettings, IconUpload } from "@/components/ui/icons";
import { ConfiguracoesForm } from "@/components/admin/ConfiguracoesForm";
import { exigirAdmin } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configurações · Painel",
};

export default async function PainelConfiguracoesPage() {
  const sessao = await exigirAdmin();
  const config = await getConfig();

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <header>
        <span className="eyebrow">Sistema</span>
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

      {/* Infraestrutura (informativo) */}
      <section className="space-y-5">
        <h2 className="font-display text-xl text-ink">Sistema</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <CartaoInfo
            icon={<IconSettings className="h-5 w-5" />}
            eyebrow="Segurança"
            titulo="Acesso ao painel"
          >
            Login com <strong className="text-ink">{sessao.email}</strong>.
            Altere e-mail e senha em{" "}
            <strong className="text-ink">Meu perfil</strong>.
          </CartaoInfo>

          <CartaoInfo
            icon={<IconHome className="h-5 w-5" />}
            eyebrow="Infraestrutura"
            titulo="Banco de dados"
          >
            MVP em <strong className="text-ink">SQLite</strong>. Para produção,
            migre para PostgreSQL ajustando{" "}
            <code className="rounded-sm bg-bone-2 px-1.5 py-0.5 font-sans text-[0.8em] text-ink">
              DATABASE_URL
            </code>
            .
          </CartaoInfo>

          <CartaoInfo
            icon={<IconUpload className="h-5 w-5" />}
            eyebrow="Mídia"
            titulo="Fotos e vídeos"
          >
            Upload local em{" "}
            <code className="rounded-sm bg-bone-2 px-1.5 py-0.5 font-sans text-[0.8em] text-ink">
              /public/uploads
            </code>
            . Para escala, troque por Cloudinary/S3 em{" "}
            <code className="rounded-sm bg-bone-2 px-1.5 py-0.5 font-sans text-[0.8em] text-ink">
              src/lib/upload.ts
            </code>
            .
          </CartaoInfo>
        </div>
      </section>
    </div>
  );
}

function CartaoInfo({
  icon,
  eyebrow,
  titulo,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <article className="panel p-6 sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-line text-brass">
        {icon}
      </span>
      <span className="eyebrow mt-5 block">{eyebrow}</span>
      <h2 className="mt-1.5 font-display text-lg text-ink">{titulo}</h2>
      <p className="mt-3 text-sm leading-relaxed text-stone-d">{children}</p>
    </article>
  );
}
