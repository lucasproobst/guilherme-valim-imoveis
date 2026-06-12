import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Paginação da listagem de imóveis.
 * Componente server: gera <Link> preservando os filtros atuais nos hrefs.
 * Não renderiza nada quando há uma única página.
 */
export function Pagination({
  pagina,
  totalPaginas,
  searchParams,
}: {
  pagina: number;
  totalPaginas: number;
  /** searchParams atuais — preservados em cada href (exceto `pagina`). */
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  /** Monta /imoveis?<filtros>&pagina=N preservando os demais parâmetros. */
  function hrefPara(n: number): string {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(searchParams)) {
      if (chave === "pagina" || valor == null) continue;
      if (Array.isArray(valor)) {
        valor.forEach((v) => v && params.append(chave, v));
      } else if (valor) {
        params.set(chave, valor);
      }
    }
    if (n > 1) params.set("pagina", String(n));
    const qs = params.toString();
    return qs ? `/imoveis?${qs}` : "/imoveis";
  }

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const temAnterior = pagina > 1;
  const temProxima = pagina < totalPaginas;

  // Estilo base dos controles (quadrados com filete)
  const controle =
    "flex h-11 w-11 items-center justify-center rounded-sm border text-sm transition-colors duration-300 ease-soft";

  return (
    <nav
      aria-label="Paginação dos imóveis"
      className="mt-16 flex items-center justify-center gap-2"
    >
      {/* Anterior */}
      {temAnterior ? (
        <Link
          href={hrefPara(pagina - 1)}
          aria-label="Página anterior"
          className={cn(
            controle,
            "border-line text-ink hover:border-brass hover:bg-brass hover:text-ink",
          )}
        >
          <IconChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={cn(controle, "cursor-not-allowed border-line text-stone/40")}
        >
          <IconChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Números */}
      {paginas.map((n) => {
        const ativa = n === pagina;
        return (
          <Link
            key={n}
            href={hrefPara(n)}
            aria-current={ativa ? "page" : undefined}
            aria-label={`Página ${n}`}
            className={cn(
              "label flex h-11 min-w-11 items-center justify-center rounded-sm border px-3 text-[0.72rem] tracking-label transition-colors duration-300 ease-soft",
              ativa
                ? "border-brass bg-brass text-ink"
                : "border-line text-stone-d hover:border-ink hover:text-ink",
            )}
          >
            {String(n).padStart(2, "0")}
          </Link>
        );
      })}

      {/* Próxima */}
      {temProxima ? (
        <Link
          href={hrefPara(pagina + 1)}
          aria-label="Próxima página"
          className={cn(
            controle,
            "border-line text-ink hover:border-brass hover:bg-brass hover:text-ink",
          )}
        >
          <IconChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={cn(controle, "cursor-not-allowed border-line text-stone/40")}
        >
          <IconChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
