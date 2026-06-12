import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variante = "primary" | "ghost" | "ghost-light" | "dark" | "link";
type Tamanho = "sm" | "md" | "lg";

const base =
  "label inline-flex items-center justify-center gap-2 text-[0.72rem] font-medium " +
  "transition-all duration-300 ease-soft focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variantes: Record<Variante, string> = {
  // Botão primário: fundo dourado, texto escuro (assinatura do design)
  primary:
    "bg-brass text-ink hover:bg-brass-2 active:translate-y-px shadow-[0_10px_30px_-12px_rgba(184,146,74,0.7)]",
  // Ghost sobre fundo claro
  ghost:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-bone",
  // Ghost sobre fundo escuro / foto (hero)
  "ghost-light":
    "border border-bone/40 text-bone hover:border-bone hover:bg-bone hover:text-ink backdrop-blur-sm",
  // Sólido escuro
  dark: "bg-ink text-bone hover:bg-ink-2 active:translate-y-px",
  // Link textual com filete
  link: "text-brass tracking-label hover:text-ink p-0",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "px-4 py-2.5 tracking-label",
  md: "px-6 py-3.5 tracking-label",
  lg: "px-8 py-4 tracking-label",
};

type CommonProps = {
  variant?: Variante;
  size?: Tamanho;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps> & { href: string };

/**
 * Botão polimórfico: vira <Link> quando recebe `href`, senão <button>.
 * O variante "link" ignora os paddings de tamanho.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    base,
    variantes[variant],
    variant !== "link" && tamanhos[size],
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
