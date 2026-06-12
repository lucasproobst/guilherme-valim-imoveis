import { Button } from "@/components/ui/Button";
import { realce } from "@/components/ui/realce";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { getConfig } from "@/lib/config";

/**
 * Hero da home — fotografia full-bleed como protagonista.
 * Banner rotativo (HeroCarousel) + texto vindos das configurações do site.
 */
export async function Hero() {
  const c = await getConfig();
  return (
    <section
      className="dark-section relative flex min-h-screen items-center overflow-hidden bg-ink"
      aria-label="Apresentação"
    >
      {/* Banner rotativo de fundo (imagens editáveis no painel) */}
      <HeroCarousel imagens={c.heroImagens} />

      {/* Scrim para legibilidade — mais denso à esquerda, onde fica o texto */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/20"
      />
      <span
        aria-hidden
        className="photo-scrim absolute inset-x-0 bottom-0 h-2/5"
      />

      {/* Conteúdo */}
      <div className="shell relative z-10 w-full pb-40 pt-32 sm:pb-48 md:pt-40">
        <div className="max-w-2xl animate-fade-up">
          <span className="eyebrow-light">{c.heroEyebrow}</span>

          <h1 className="mt-6 font-display text-5xl leading-[1.04] text-bone text-shadow-soft sm:text-6xl lg:text-7xl">
            {realce(c.heroTitulo)}
          </h1>

          <p className="mt-7 max-w-lg text-base leading-relaxed text-bone/80 sm:text-lg">
            {c.heroSubtitulo}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/imoveis" variant="primary" size="lg">
              Ver portfólio
            </Button>
            <Button href="/contato" variant="ghost-light" size="lg">
              Agendar visita
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
