import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cn } from "@/lib/cn";

/**
 * Moldura padrão das páginas internas do site (Header sólido + main + Footer).
 * A home usa <Header transparent /> diretamente porque tem hero full-bleed.
 *
 * `padTop` adiciona o respiro para o header fixo (use false em páginas com
 * banner próprio que já compensa o topo).
 */
export function SiteShell({
  children,
  padTop = true,
  className,
}: {
  children: React.ReactNode;
  padTop?: boolean;
  className?: string;
}) {
  return (
    <>
      <Header />
      <main className={cn(padTop && "pt-20 md:pt-24", className)}>
        {children}
      </main>
      <Footer />
    </>
  );
}
