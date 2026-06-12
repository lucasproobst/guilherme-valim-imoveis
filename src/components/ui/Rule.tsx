import { cn } from "@/lib/cn";

/**
 * Filete de seção. `brass` = filete dourado curto (detalhe sob títulos);
 * sem brass = filete fino claro de largura total separando blocos.
 */
export function Rule({
  brass = false,
  className,
}: {
  brass?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(brass ? "rule-brass" : "rule", "block", className)}
    />
  );
}
