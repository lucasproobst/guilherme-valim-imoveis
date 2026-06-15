import { versiculoDoDia } from "@/lib/versiculos";

/**
 * "Palavra do dia" — versículo bíblico (prosperidade/finanças) que troca
 * diariamente. Minimalista, na identidade do site.
 *  - variant "hero": cartão translúcido que sobe sobre a base do hero (home);
 *  - variant "sobre": faixa escura simples (página Sobre).
 */
export function VersiculoDoDia({
  variant = "hero",
}: {
  variant?: "hero" | "sobre";
}) {
  const { texto, referencia } = versiculoDoDia();

  const conteudo = (
    <>
      <span className="eyebrow-light">Palavra do dia</span>
      <blockquote className="mx-auto mt-3 max-w-3xl">
        <p className="font-display text-xl italic leading-relaxed text-bone text-shadow-soft sm:text-2xl">
          {texto}
        </p>
      </blockquote>
      <div className="mt-4 flex items-center justify-center gap-3">
        <span aria-hidden className="h-px w-6 bg-brass/40" />
        <cite className="eyebrow-light not-italic text-brass-2">
          {referencia}
        </cite>
        <span aria-hidden className="h-px w-6 bg-brass/40" />
      </div>
    </>
  );

  if (variant === "sobre") {
    return (
      <section
        className="dark-section bg-ink py-10 md:py-12"
        aria-label="Palavra do dia"
      >
        <div className="reveal shell text-center">{conteudo}</div>
      </section>
    );
  }

  return (
    <section
      className="dark-section relative z-20 -mt-20 sm:-mt-24"
      aria-label="Palavra do dia"
    >
      <div className="reveal shell">
        <figure className="rounded-sm border border-brass/20 bg-ink/70 px-6 py-6 text-center backdrop-blur-md sm:px-10 sm:py-7">
          {conteudo}
        </figure>
      </div>
    </section>
  );
}
