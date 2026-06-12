"use client";

/**
 * Lista de leads/contatos recebidos.
 * Desktop: tabela; Mobile: cartões. Filtro local por status (apenas exibição —
 * não há persistência de status nesta etapa). Cada lead traz atalho direto para
 * o WhatsApp com mensagem pré-preenchida.
 */

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { IconWhatsApp } from "@/components/ui/icons";
import { STATUS_LEAD } from "@/lib/constants";
import { useConfig } from "@/lib/config-context";
import { formatDataHora, linkWhatsApp } from "@/lib/format";
import type { LeadDTO } from "@/lib/types";

/** Mapa value -> label dos status (ex.: "novo" -> "Novo"). */
const LABEL_STATUS: Record<string, string> = Object.fromEntries(
  STATUS_LEAD.map((s) => [s.value, s.label]),
);

/** Tom da etiqueta de status conforme o estágio do lead. */
function tomStatus(status: string): "brass" | "ink" | "bone" | "stone" {
  switch (status) {
    case "novo":
      return "brass";
    case "em_contato":
      return "ink";
    case "atendido":
      return "bone";
    default:
      return "stone";
  }
}

/** Origem legível do contato. */
function rotuloOrigem(origem: string): string {
  switch (origem) {
    case "imovel":
      return "Imóvel";
    case "contato":
      return "Contato";
    case "site":
      return "Site";
    default:
      return origem;
  }
}

/** Mensagem padrão ao abrir a conversa pelo painel. */
function mensagemWhatsapp(lead: LeadDTO, marca: string): string {
  const ref = lead.imovelTitulo
    ? ` sobre o imóvel "${lead.imovelTitulo}"`
    : "";
  return `Olá ${lead.nome}, aqui é da ${marca}. Recebi seu contato${ref} e fico à disposição.`;
}

export function LeadsList({ leads }: { leads: LeadDTO[] }) {
  const { marca } = useConfig();
  const [filtro, setFiltro] = useState<string>("todos");

  const visiveis = useMemo(() => {
    if (filtro === "todos") return leads;
    return leads.filter((l) => l.status === filtro);
  }, [leads, filtro]);

  if (leads.length === 0) {
    return (
      <div className="panel flex flex-col items-center px-8 py-20 text-center">
        <span className="eyebrow">Caixa de entrada</span>
        <h2 className="mt-4 font-display text-2xl text-ink">
          Nenhum contato recebido
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-d">
          Os contatos enviados pelo site e pelas páginas dos imóveis aparecerão
          aqui, com atalho direto para o WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro local por status */}
      <div className="flex flex-wrap items-center gap-2">
        <FiltroChip
          ativo={filtro === "todos"}
          onClick={() => setFiltro("todos")}
        >
          Todos
        </FiltroChip>
        {STATUS_LEAD.map((s) => (
          <FiltroChip
            key={s.value}
            ativo={filtro === s.value}
            onClick={() => setFiltro(s.value)}
          >
            {s.label}
          </FiltroChip>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="panel px-8 py-14 text-center">
          <p className="text-sm text-stone-d">
            Nenhum contato com este status.
          </p>
        </div>
      ) : (
        <>
          {/* ---------- Desktop: tabela ---------- */}
          <div className="panel hidden overflow-hidden lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-bone-2/50">
                  <th className="label px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                    Contato
                  </th>
                  <th className="label px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                    Interesse
                  </th>
                  <th className="label px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                    Origem
                  </th>
                  <th className="label px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                    Recebido
                  </th>
                  <th className="label px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                    Status
                  </th>
                  <th className="label px-6 py-4 text-right text-[0.62rem] font-medium tracking-label text-stone-d">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-line/70 transition-colors last:border-0 hover:bg-bone-2/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!lead.lido && (
                          <span
                            aria-label="Não lido"
                            className="h-2 w-2 shrink-0 rounded-full bg-brass"
                          />
                        )}
                        <div className="min-w-0">
                          <p
                            className={
                              lead.lido
                                ? "truncate font-display text-base text-ink"
                                : "truncate font-display text-base font-semibold text-ink"
                            }
                          >
                            {lead.nome}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-stone-d">
                            {lead.whatsapp}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-d">
                      <span className="line-clamp-1">
                        {lead.imovelTitulo ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tom="outline">{rotuloOrigem(lead.origem)}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-stone-d">
                      {formatDataHora(lead.criadoEm)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tom={tomStatus(lead.status)}>
                        {LABEL_STATUS[lead.status] ?? lead.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <a
                          href={linkWhatsApp(
                            lead.whatsapp,
                            mensagemWhatsapp(lead, marca),
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Conversar com ${lead.nome} no WhatsApp`}
                          className="label inline-flex items-center gap-2 rounded-sm border border-ink/25 px-4 py-2.5 text-[0.66rem] font-medium tracking-label text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                        >
                          <IconWhatsApp className="h-4 w-4" />
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---------- Mobile: cartões ---------- */}
          <div className="space-y-4 lg:hidden">
            {visiveis.map((lead) => (
              <article key={lead.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!lead.lido && (
                      <span
                        aria-label="Não lido"
                        className="h-2 w-2 shrink-0 rounded-full bg-brass"
                      />
                    )}
                    <p
                      className={
                        lead.lido
                          ? "font-display text-lg text-ink"
                          : "font-display text-lg font-semibold text-ink"
                      }
                    >
                      {lead.nome}
                    </p>
                  </div>
                  <Badge tom={tomStatus(lead.status)}>
                    {LABEL_STATUS[lead.status] ?? lead.status}
                  </Badge>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone">Telefone</dt>
                    <dd className="text-right text-stone-d">{lead.whatsapp}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone">Interesse</dt>
                    <dd className="text-right text-stone-d">
                      {lead.imovelTitulo ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone">Origem</dt>
                    <dd>
                      <Badge tom="outline">{rotuloOrigem(lead.origem)}</Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-stone">Recebido</dt>
                    <dd className="text-right text-stone-d">
                      {formatDataHora(lead.criadoEm)}
                    </dd>
                  </div>
                </dl>

                {lead.mensagem && (
                  <p className="mt-4 border-l-2 border-line pl-3 text-sm italic leading-relaxed text-stone-d">
                    “{lead.mensagem}”
                  </p>
                )}

                <a
                  href={linkWhatsApp(lead.whatsapp, mensagemWhatsapp(lead, marca))}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Conversar com ${lead.nome} no WhatsApp`}
                  className="label mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-ink/25 px-4 py-3 text-[0.66rem] font-medium tracking-label text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  WhatsApp
                </a>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FiltroChip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        ativo
          ? "label rounded-sm bg-ink px-4 py-2 text-[0.62rem] font-medium tracking-label text-bone"
          : "label rounded-sm border border-line px-4 py-2 text-[0.62rem] font-medium tracking-label text-stone-d transition-colors hover:border-ink/40 hover:text-ink"
      }
    >
      {children}
    </button>
  );
}
