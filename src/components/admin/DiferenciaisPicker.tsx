"use client";

/**
 * Seletor de diferenciais — chips clicáveis (toggle).
 * Ativo: fundo dourado, borda brass, texto escuro e marca de seleção.
 * Inativo: borda fina clara com leve hover. Acessível via aria-pressed.
 */

import { DIFERENCIAIS } from "@/lib/constants";
import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export function DiferenciaisPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (proximo: string[]) => void;
}) {
  function alternar(item: string) {
    if (value.includes(item)) {
      onChange(value.filter((d) => d !== item));
    } else {
      onChange([...value, item]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {DIFERENCIAIS.map((item) => {
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
  );
}
