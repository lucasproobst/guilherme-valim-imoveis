import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Item de especificação (ícone + valor + rótulo). Usado em cards e specs bar. */
export function SpecItem({
  icon,
  valor,
  label,
  light = false,
  className,
}: {
  icon: ReactNode;
  valor: ReactNode;
  label: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className={cn("shrink-0", light ? "text-brass-2" : "text-brass")}>
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display text-base",
            light ? "text-bone" : "text-ink",
          )}
        >
          {valor}
        </span>
        <span
          className={cn(
            "label text-[0.58rem] tracking-label",
            light ? "text-bone/55" : "text-stone",
          )}
        >
          {label}
        </span>
      </span>
    </div>
  );
}
