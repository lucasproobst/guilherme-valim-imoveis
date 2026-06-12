import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconArrowUpRight } from "@/components/ui/icons";

/**
 * Cartão de indicador da visão geral do painel.
 * Número grande em Playfair, ícone num círculo dourado claro, rótulo eyebrow.
 * Com `href`, o cartão inteiro vira link e ganha a seta diagonal.
 */
export function StatCard({
  icon,
  valor,
  label,
  href,
  hint,
}: {
  icon: ReactNode;
  valor: number | string;
  label: string;
  href?: string;
  hint?: string;
}) {
  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/12 text-brass">
          {icon}
        </span>
        {href && (
          <IconArrowUpRight className="h-5 w-5 text-stone transition-colors duration-300 group-hover:text-brass" />
        )}
      </div>

      <p className="eyebrow mt-7">{label}</p>
      <p className="mt-1 font-display text-4xl leading-none text-ink">{valor}</p>
      {hint && <p className="mt-3 text-sm text-stone-d">{hint}</p>}
    </>
  );

  const classesBase =
    "panel block p-6 transition-all duration-500 ease-soft md:p-7";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          classesBase,
          "group hover:-translate-y-1 hover:border-brass/40 hover:shadow-card-hover",
        )}
      >
        {conteudo}
      </Link>
    );
  }

  return <div className={classesBase}>{conteudo}</div>;
}
