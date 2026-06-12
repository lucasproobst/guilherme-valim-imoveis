import { SectionHeading } from "@/components/site/SectionHeading";
import { IconCheck } from "@/components/ui/icons";

/**
 * Lista de diferenciais do imóvel — grade de chips com marca dourada.
 * Não renderiza nada quando a lista está vazia.
 */
export function DiferenciaisList({ itens }: { itens: string[] }) {
  if (!itens || itens.length === 0) return null;

  return (
    <div className="flex flex-col gap-7">
      <SectionHeading eyebrow="O que torna único" titulo="Diferenciais" />
      <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
        {itens.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 border-b border-line/70 pb-3.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass/12 text-brass">
              <IconCheck className="h-4 w-4" />
            </span>
            <span className="text-[0.95rem] text-stone-d">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
