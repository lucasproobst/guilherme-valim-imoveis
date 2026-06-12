"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useConfig } from "@/lib/config-context";

/**
 * Marca "<Nome> / <Subtítulo>", lida das configurações do site (useConfig).
 * Renderiza a última palavra em itálico dourado. `tone="light"` para fundos
 * escuros / hero.
 */
export function Logo({
  tone = "dark",
  href = "/",
  className,
}: {
  tone?: "light" | "dark";
  href?: string;
  className?: string;
}) {
  const { marca, subtitulo } = useConfig();
  const corMarca = tone === "light" ? "text-bone" : "text-ink";
  const corSub = tone === "light" ? "text-bone/70" : "text-stone-d";

  // Última palavra em itálico dourado (ex.: "Guilherme" + *Valim*).
  const palavras = marca.trim().split(/\s+/);
  const ultima = palavras[palavras.length - 1];
  const inicio = palavras.slice(0, -1).join(" ");

  return (
    <Link
      href={href}
      className={cn("group inline-flex flex-col leading-none", className)}
      aria-label={`${marca} — ${subtitulo}`}
    >
      <span
        className={cn(
          "font-display text-xl tracking-tight transition-colors",
          corMarca,
        )}
      >
        {inicio && <>{inicio} </>}
        <span className="accent-italic">{ultima}</span>
      </span>
      <span
        className={cn(
          "label mt-1 text-[0.55rem] font-medium tracking-eyebrow",
          corSub,
        )}
      >
        {subtitulo}
      </span>
    </Link>
  );
}
