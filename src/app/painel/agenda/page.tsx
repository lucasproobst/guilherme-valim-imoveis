/**
 * Painel — Agenda de visitas.
 * Como ainda não há um modelo de "Visita", reunimos aqui os contatos originados
 * nas páginas dos imóveis (origem === "imovel"), tratados como solicitações de
 * visita. Apresentação em linha do tempo, agrupada por data.
 */

import { Badge } from "@/components/ui/Badge";
import { IconCalendar, IconMapPin, IconWhatsApp } from "@/components/ui/icons";
import { getConfig } from "@/lib/config";
import { formatData, formatDataHora, linkWhatsApp } from "@/lib/format";
import { listarLeads } from "@/lib/queries";
import type { LeadDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agenda de visitas · Painel",
};

/** Agrupa solicitações por dia (data formatada), preservando a ordem recebida. */
function agruparPorData(
  leads: LeadDTO[],
): { data: string; itens: LeadDTO[] }[] {
  const grupos: { data: string; itens: LeadDTO[] }[] = [];
  for (const lead of leads) {
    const data = formatData(lead.criadoEm);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.data === data) {
      ultimo.itens.push(lead);
    } else {
      grupos.push({ data, itens: [lead] });
    }
  }
  return grupos;
}

export default async function PainelAgendaPage() {
  const c = await getConfig();
  const leads = await listarLeads();
  // Apenas contatos vindos das páginas dos imóveis = solicitações de visita.
  const solicitacoes = leads.filter((l) => l.origem === "imovel");
  const grupos = agruparPorData(solicitacoes);

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <header>
        <span className="eyebrow">Atendimento</span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Agenda de visitas
        </h1>
        <p className="mt-2 text-sm text-stone-d">
          Solicitações de visita recebidas.
        </p>
      </header>

      {/* Aviso sobre a natureza dos itens */}
      <p className="rounded-sm border border-line bg-bone-2/40 px-4 py-3 text-xs leading-relaxed text-stone-d">
        Estas são as solicitações enviadas a partir das páginas dos imóveis.
        Confirme cada visita diretamente com o interessado pelo WhatsApp.
      </p>

      {solicitacoes.length === 0 ? (
        <div className="panel flex flex-col items-center px-8 py-20 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-brass">
            <IconCalendar className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-2xl text-ink">
            Nenhuma visita solicitada
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-d">
            Quando um interessado pedir uma visita pela página de um imóvel, a
            solicitação aparecerá aqui em ordem cronológica.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {grupos.map((grupo) => (
            <section key={grupo.data}>
              {/* Marco do dia */}
              <div className="mb-6 flex items-center gap-4">
                <span className="label text-[0.7rem] font-medium tracking-eyebrow text-brass">
                  {grupo.data}
                </span>
                <span aria-hidden className="rule flex-1" />
              </div>

              {/* Linha do tempo */}
              <ol className="relative space-y-6 border-l border-line pl-6">
                {grupo.itens.map((lead) => (
                  <li key={lead.id} className="relative">
                    {/* Marcador */}
                    <span
                      aria-hidden
                      className="absolute -left-[1.6875rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bone bg-brass"
                    />
                    <article className="panel p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-lg text-ink">
                              {lead.nome}
                            </p>
                            <Badge tom="brass">Visita</Badge>
                          </div>

                          <p className="mt-2 flex items-center gap-2 text-sm text-stone-d">
                            <IconMapPin className="h-4 w-4 shrink-0 text-brass" />
                            <span className="truncate">
                              {lead.imovelTitulo ?? "Imóvel não identificado"}
                            </span>
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-stone">
                            <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                            {formatDataHora(lead.criadoEm)}
                          </p>

                          {lead.mensagem && (
                            <p className="mt-3 border-l-2 border-line pl-3 text-sm italic leading-relaxed text-stone-d">
                              “{lead.mensagem}”
                            </p>
                          )}
                        </div>

                        <a
                          href={linkWhatsApp(
                            lead.whatsapp,
                            `Olá ${lead.nome}, aqui é da ${c.marca}. Recebi sua solicitação de visita${
                              lead.imovelTitulo
                                ? ` ao imóvel "${lead.imovelTitulo}"`
                                : ""
                            }. Vamos combinar o melhor horário?`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Combinar visita com ${lead.nome} no WhatsApp`}
                          className="label inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border border-ink/25 px-4 py-2.5 text-[0.66rem] font-medium tracking-label text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
                        >
                          <IconWhatsApp className="h-4 w-4" />
                          WhatsApp
                        </a>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
