"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Select, Input, Rotulo } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { IconSliders, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Valores atuais dos filtros (vindos dos searchParams da página). */
export type ValoresFiltro = {
  cidade?: string;
  condominioNome?: string;
  tipo?: string;
  finalidade?: string;
  dormitorios?: string;
  precoMin?: string;
  precoMax?: string;
  ordenar?: string;
};

type Opcao = { value: string; label: string };

/**
 * Barra de filtros da listagem de imóveis.
 * Desktop: linha horizontal de selects. Mobile: colapsa atrás de "Filtros".
 * Ao alterar qualquer campo, navega para /imoveis?<query> resetando a página.
 */
export function FilterBar({
  cidades,
  condominios,
  tipos,
  finalidades,
  ordenacoes,
  valores,
}: {
  cidades: string[];
  condominios: string[];
  tipos: readonly string[];
  finalidades: readonly string[];
  ordenacoes: readonly Opcao[];
  valores: ValoresFiltro;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  /** Recalcula a query a partir do estado atual + uma alteração e navega. */
  function aplicar(parcial: Partial<ValoresFiltro>) {
    const proximos: ValoresFiltro = { ...valores, ...parcial };
    const params = new URLSearchParams();
    // Só inclui o que tem valor (mantém a URL limpa)
    Object.entries(proximos).forEach(([chave, valor]) => {
      if (valor) params.set(chave, valor);
    });
    // Qualquer mudança de filtro reinicia a paginação
    const qs = params.toString();
    router.push(qs ? `/imoveis?${qs}` : "/imoveis");
  }

  function limpar() {
    router.push("/imoveis");
    setAberto(false);
  }

  const algumFiltro = Boolean(
    valores.cidade ||
      valores.condominioNome ||
      valores.tipo ||
      valores.finalidade ||
      valores.dormitorios ||
      valores.precoMin ||
      valores.precoMax,
  );

  // Campos compartilhados entre desktop e mobile (apenas a marcação muda)
  const campos = (
    <>
      {/* Cidade */}
      <div className="flex flex-col">
        <Rotulo htmlFor="f-cidade">Cidade</Rotulo>
        <Select
          id="f-cidade"
          value={valores.cidade ?? ""}
          onChange={(e) => aplicar({ cidade: e.target.value })}
          aria-label="Filtrar por cidade"
        >
          <option value="">Todas</option>
          {cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {/* Condomínio */}
      {condominios.length > 0 && (
        <div className="flex flex-col">
          <Rotulo htmlFor="f-condominio">Condomínio</Rotulo>
          <Select
            id="f-condominio"
            value={valores.condominioNome ?? ""}
            onChange={(e) => aplicar({ condominioNome: e.target.value })}
            aria-label="Filtrar por condomínio"
          >
            <option value="">Todos</option>
            {condominios.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Tipo */}
      <div className="flex flex-col">
        <Rotulo htmlFor="f-tipo">Tipo</Rotulo>
        <Select
          id="f-tipo"
          value={valores.tipo ?? ""}
          onChange={(e) => aplicar({ tipo: e.target.value })}
          aria-label="Filtrar por tipo de imóvel"
        >
          <option value="">Todos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {/* Finalidade */}
      <div className="flex flex-col">
        <Rotulo htmlFor="f-finalidade">Finalidade</Rotulo>
        <Select
          id="f-finalidade"
          value={valores.finalidade ?? ""}
          onChange={(e) => aplicar({ finalidade: e.target.value })}
          aria-label="Filtrar por finalidade"
        >
          <option value="">Todas</option>
          {finalidades.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
      </div>

      {/* Dormitórios (suítes mínimas) */}
      <div className="flex flex-col">
        <Rotulo htmlFor="f-dormitorios">Suítes</Rotulo>
        <Select
          id="f-dormitorios"
          value={valores.dormitorios ?? ""}
          onChange={(e) => aplicar({ dormitorios: e.target.value })}
          aria-label="Filtrar por número mínimo de suítes"
        >
          <option value="">Qualquer</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>
              {n}+
            </option>
          ))}
        </Select>
      </div>

      {/* Faixa de preço */}
      <div className="flex flex-col">
        <Rotulo htmlFor="f-preco-min">Preço mín.</Rotulo>
        <Input
          id="f-preco-min"
          type="number"
          inputMode="numeric"
          min={0}
          step={50000}
          placeholder="R$"
          defaultValue={valores.precoMin ?? ""}
          onBlur={(e) => aplicar({ precoMin: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") aplicar({ precoMin: e.currentTarget.value });
          }}
          aria-label="Preço mínimo"
        />
      </div>

      <div className="flex flex-col">
        <Rotulo htmlFor="f-preco-max">Preço máx.</Rotulo>
        <Input
          id="f-preco-max"
          type="number"
          inputMode="numeric"
          min={0}
          step={50000}
          placeholder="R$"
          defaultValue={valores.precoMax ?? ""}
          onBlur={(e) => aplicar({ precoMax: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") aplicar({ precoMax: e.currentTarget.value });
          }}
          aria-label="Preço máximo"
        />
      </div>

      {/* Ordenar */}
      <div className="flex flex-col">
        <Rotulo htmlFor="f-ordenar">Ordenar</Rotulo>
        <Select
          id="f-ordenar"
          value={valores.ordenar ?? ""}
          onChange={(e) => aplicar({ ordenar: e.target.value })}
          aria-label="Ordenar resultados"
        >
          {ordenacoes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </>
  );

  return (
    <div className="border-y border-line bg-bone-2/60">
      <div className="shell py-5">
        {/* Cabeçalho mobile: botão de abrir/fechar filtros */}
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="painel-filtros"
            className="label inline-flex items-center gap-2 text-[0.72rem] tracking-label text-ink"
          >
            <IconSliders className="h-4 w-4 text-brass" />
            Filtros
            {algumFiltro && (
              <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brass" />
            )}
          </button>
          {algumFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="label inline-flex items-center gap-1.5 text-[0.66rem] tracking-label text-stone-d transition-colors hover:text-ink"
            >
              <IconX className="h-3.5 w-3.5" />
              Limpar
            </button>
          )}
        </div>

        {/* Painel de campos: empilhado no mobile (colapsável), grade no desktop */}
        <div
          id="painel-filtros"
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2",
            "mt-4 md:mt-0 md:grid-cols-4 md:items-end md:gap-3 lg:grid-cols-8",
            aberto ? "grid" : "hidden md:grid",
          )}
        >
          {campos}
        </div>

        {/* Limpar filtros — visível no desktop quando há filtros ativos */}
        {algumFiltro && (
          <div className="mt-4 hidden justify-end md:flex">
            <Button variant="link" size="sm" onClick={limpar} type="button">
              <IconX className="h-3.5 w-3.5" />
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
