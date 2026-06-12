import Image from "next/image";
import Link from "next/link";
import { getResumoPainel, listarLeads, listarImoveisAdmin } from "@/lib/queries";
import { formatPreco, formatDataHora } from "@/lib/format";
import { STATUS_LEAD } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/admin/StatCard";
import {
  IconHome,
  IconEdit,
  IconUsers,
  IconGrid,
  IconArrowRight,
} from "@/components/ui/icons";
import type { ImovelDTO, LeadDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Rótulo legível do status do lead (cai no valor cru se não mapeado). */
function rotuloStatus(valor: string): string {
  return STATUS_LEAD.find((s) => s.value === valor)?.label ?? valor;
}

/** Tom da etiqueta conforme o estágio do lead. */
function tomStatus(valor: string): "brass" | "ink" | "bone" | "stone" | "outline" {
  switch (valor) {
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

/** Capa do imóvel a partir das fotos ordenadas. */
function capaDe(imovel: ImovelDTO): string | null {
  return imovel.fotos.find((f) => f.capa)?.url ?? imovel.fotos[0]?.url ?? null;
}

export default async function VisaoGeralPage() {
  const [resumo, leads, imoveis] = await Promise.all([
    getResumoPainel(),
    listarLeads(),
    listarImoveisAdmin(),
  ]);

  const ultimosLeads = leads.slice(0, 4);
  const imoveisRecentes = imoveis.slice(0, 4);

  return (
    <div className="animate-fade-up">
      {/* Cabeçalho */}
      <header>
        <p className="eyebrow">Painel</p>
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
          Visão geral
        </h1>
        <span className="rule-brass mt-5 block" />
      </header>

      {/* Indicadores */}
      <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<IconHome className="h-5 w-5" />}
          valor={resumo.publicados}
          label="Imóveis publicados"
          href="/painel/imoveis"
        />
        <StatCard
          icon={<IconEdit className="h-5 w-5" />}
          valor={resumo.rascunhos}
          label="Rascunhos"
          hint="Aguardando publicação"
        />
        <StatCard
          icon={<IconUsers className="h-5 w-5" />}
          valor={resumo.leadsNovos}
          label="Leads novos"
          href="/painel/leads"
        />
        <StatCard
          icon={<IconGrid className="h-5 w-5" />}
          valor={resumo.leadsTotal}
          label="Leads no total"
        />
      </section>

      {/* Ações rápidas */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/painel/imoveis/novo" variant="primary" size="sm">
          Novo imóvel
        </Button>
        <Button href="/painel/imoveis" variant="ghost" size="sm">
          Ver imóveis
        </Button>
      </div>

      {/* Listas: leads recentes + imóveis recentes */}
      <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UltimosLeads leads={ultimosLeads} />
        <ImoveisRecentes imoveis={imoveisRecentes} />
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Blocos da visão geral
 * ------------------------------------------------------------------ */

function CabecalhoBloco({
  titulo,
  href,
  verLabel,
}: {
  titulo: string;
  href: string;
  verLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
      <h2 className="font-display text-xl text-ink">{titulo}</h2>
      <Link
        href={href}
        className="label link-underline inline-flex items-center gap-1.5 text-[0.68rem] font-medium tracking-label text-stone-d transition-colors hover:text-brass"
      >
        {verLabel}
        <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function UltimosLeads({ leads }: { leads: LeadDTO[] }) {
  return (
    <div className="panel overflow-hidden">
      <CabecalhoBloco titulo="Últimos leads" href="/painel/leads" verLabel="Ver todos" />

      {leads.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-stone-d">
          Nenhum contato recebido ainda.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-bone-2/50"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-base text-ink">{lead.nome}</p>
                <p className="mt-0.5 truncate text-sm text-stone-d">
                  {lead.imovelTitulo ?? "Contato geral"}
                </p>
                <p className="mt-1 text-xs text-stone">{formatDataHora(lead.criadoEm)}</p>
              </div>
              <Badge tom={tomStatus(lead.status)}>{rotuloStatus(lead.status)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImoveisRecentes({ imoveis }: { imoveis: ImovelDTO[] }) {
  return (
    <div className="panel overflow-hidden">
      <CabecalhoBloco titulo="Imóveis recentes" href="/painel/imoveis" verLabel="Gerenciar" />

      {imoveis.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-stone-d">
          Nenhum imóvel cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {imoveis.map((imovel) => {
            const capa = capaDe(imovel);
            return (
              <li key={imovel.id}>
                <Link
                  href={`/painel/imoveis/${imovel.id}`}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-bone-2/50"
                >
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-ink-2">
                    {capa ? (
                      <Image
                        src={capa}
                        alt={imovel.titulo}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-xs italic text-brass/50">
                        M.V
                      </span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-ink transition-colors group-hover:text-brass">
                      {imovel.titulo}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-d">{formatPreco(imovel.preco)}</p>
                  </div>

                  <Badge tom={imovel.publicado ? "brass" : "stone"}>
                    {imovel.publicado ? "Publicado" : "Rascunho"}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
