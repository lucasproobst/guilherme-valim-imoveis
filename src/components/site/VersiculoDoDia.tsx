import { versiculoDoDia } from "@/lib/versiculos";

/**
 * "Palavra do dia" — um versículo bíblico sobre prosperidade/finanças que
 * troca diariamente. Sobe sobre a base do hero (margem negativa) com o mesmo
 * cartão ink translúcido + filetes dourados da identidade do site.
 */
export function VersiculoDoDia() {
  const { texto, referencia } = versiculoDoDia();

  return (
    <section
      className="dark-section relative z-20 -mt-24 sm:-mt-28"
      aria-label="Palavra do dia"
    >
      <div className="reveal shell">
        <figure className="relative overflow-hidden rounded-sm border border-brass/25 bg-ink/70 px-6 py-12 text-center backdrop-blur-md sm:px-12 sm:py-14">
          {/* Aspas decorativas ao fundo */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 select-none font-display text-7xl leading-none text-brass/20 sm:text-8xl"
          >
            &ldquo;
          </span>

          <span className="eyebrow-light relative">Palavra do dia</span>

          <blockquote className="relative mx-auto mt-5 max-w-3xl">
            <p className="font-display text-xl italic leading-relaxed text-bone text-shadow-soft sm:text-2xl lg:text-[1.7rem] lg:leading-relaxed">
              {texto}
            </p>
          </blockquote>

          <figcaption className="relative mt-7 flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-8 bg-brass/50" />
            <cite className="eyebrow-light not-italic text-brass-2">
              {referencia}
            </cite>
            <span aria-hidden className="h-px w-8 bg-brass/50" />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
