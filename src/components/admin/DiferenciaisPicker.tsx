"use client";

/**
 * Seletor de diferenciais — chips clicáveis (toggle) + campo para adicionar um
 * diferencial personalizado que não esteja na lista padrão.
 * Ativo: fundo dourado, borda brass, texto escuro e marca de seleção.
 */

import { useState } from "react";
import { DIFERENCIAIS } from "@/lib/constants";
import { IconCheck, IconPlus } from "@/components/ui/icons";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function DiferenciaisPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (proximo: string[]) => void;
}) {
  const [novo, setNovo] = useState("");

  // Diferenciais personalizados: estão selecionados mas fora da lista padrão.
  const personalizados = value.filter(
    (v) => !DIFERENCIAIS.some((d) => d === v),
  );
  const chips = [...DIFERENCIAIS, ...personalizados];

  function alternar(item: string) {
    if (value.includes(item)) {
      onChange(value.filter((d) => d !== item));
    } else {
      onChange([...value, item]);
    }
  }

  function adicionar() {
    const texto = novo.trim();
    if (!texto) return;
    // Já selecionado? (case-insensitive) — só limpa o campo.
    if (value.some((v) => v.toLowerCase() === texto.toLowerCase())) {
      setNovo("");
      return;
    }
    // Se bate com um da lista padrão, usa o rótulo oficial; senão, o digitado.
    const padrao = DIFERENCIAIS.find(
      (d) => d.toLowerCase() === texto.toLowerCase(),
    );
    onChange([...value, padrao ?? texto]);
    setNovo("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2.5">
        {chips.map((item) => {
          const ativo = value.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={ativo}
              onClick={() => alternar(item)}
              className={cn(
                "label inline-flex items-center gap-1.5 rounded-sm border px-3.5 py-2 text-[0.66rem] font-medium tracking-label transition-all duration-200",
                ativo
                  ? "border-brass bg-brass/15 text-ink"
                  : "border-line text-stone-d hover:border-ink/40 hover:text-ink",
              )}
            >
              {ativo && <IconCheck className="h-3.5 w-3.5 text-brass" />}
              {item}
            </button>
          );
        })}
      </div>

      {/* Adicionar diferencial personalizado */}
      <div className="flex gap-2">
        <Input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="Adicionar outro diferencial…"
          className="flex-1"
          aria-label="Adicionar diferencial personalizado"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={adicionar}
          className="shrink-0"
        >
          <IconPlus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
