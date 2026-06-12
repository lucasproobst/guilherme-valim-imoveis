"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { IconMenu, IconX } from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/constants";
import { useConfig } from "@/lib/config-context";
import { cn } from "@/lib/cn";

/**
 * Cabeçalho público.
 * - `transparent` (home): começa transparente sobre o hero e ganha fundo ao rolar.
 * - inner pages: fundo creme sólido desde o topo.
 * Inclui menu mobile em painel deslizante.
 */
export function Header({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const { creci } = useConfig();

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // fecha o menu ao trocar de rota
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  // trava o scroll do body enquanto o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  const flutuante = transparent && !scrolled;
  const tone = flutuante ? "light" : "dark";

  return (
    <>
      <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-soft",
        flutuante
          ? "bg-transparent py-5"
          : "border-b border-line/60 bg-bone/90 py-3 backdrop-blur-md",
      )}
    >
      <div className="shell flex items-center justify-between">
        <Logo tone={tone} />

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((item) => {
            const ativo =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "label link-underline text-[0.68rem] tracking-label transition-colors",
                  flutuante ? "text-bone/85 hover:text-bone" : "text-ink/70 hover:text-ink",
                  ativo && (flutuante ? "text-brass-2" : "text-brass"),
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button
            href="/contato"
            variant={flutuante ? "ghost-light" : "primary"}
            size="sm"
          >
            Agendar visita
          </Button>
        </div>

        {/* Botão menu mobile */}
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className={cn(
            "lg:hidden",
            flutuante ? "text-bone" : "text-ink",
          )}
          aria-label="Abrir menu"
        >
          <IconMenu className="h-7 w-7" />
        </button>
      </div>
      </header>

      {/* Painel mobile — renderizado FORA do <header>. O header usa
          backdrop-blur (backdrop-filter), que vira "containing block" para
          descendentes fixed; se o menu ficasse dentro, o overlay ficaria
          preso à barra ao rolar (transparente). Como irmão, cobre a tela toda. */}
      {menuAberto && (
        <div
          className="dark-section fixed inset-0 z-[70] flex flex-col bg-ink lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
        >
          <div className="shell flex items-center justify-between py-5">
            <Logo tone="light" />
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-bone/20 text-bone transition-colors hover:border-bone/50"
              aria-label="Fechar menu"
            >
              <IconX className="h-6 w-6" />
            </button>
          </div>

          <nav
            className="shell mt-8 flex flex-col gap-6"
            aria-label="Principal (mobile)"
          >
            {NAV_LINKS.map((item) => {
              const ativo =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-display text-3xl transition-colors hover:text-brass-2",
                    ativo ? "text-brass-2" : "text-bone",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="rule-brass mt-2" />
            <Button href="/contato" variant="primary" className="mt-2 w-full">
              Agendar visita
            </Button>
          </nav>

          <div className="shell mt-auto py-8">
            <span className="eyebrow-light">{creci}</span>
          </div>
        </div>
      )}
    </>
  );
}
