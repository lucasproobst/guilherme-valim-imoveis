import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { realce } from "@/components/ui/realce";
import { getConfig } from "@/lib/config";

/**
 * Bloco "Sobre" da home — fundo ink (contexto escuro).
 * Retrato à esquerda (aspect 4/5) com filete dourado; texto e assinatura à direita.
 * Título, parágrafos e mini-destaques vêm das configurações do site.
 */
export async function AboutPreview() {
  const c = await getConfig();
  const paragrafos = c.sobreResumo.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <section className="dark-section bg-ink py-24 md:py-32">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Retrato */}
        <div className="reveal reveal-left relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-brass/30 bg-ink-2">
            <Image
              src={c.retratoUrl}
              alt={`Retrato de ${c.nome}`}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Texto */}
        <div className="reveal reveal-right">
          <Eyebrow light>Quem assina a coleção</Eyebrow>

          <h2 className="mt-6 max-w-xl font-display text-4xl leading-[1.1] text-bone sm:text-[2.7rem]">
            {realce(c.sobreTitulo)}
          </h2>

          <div className="mt-7 max-w-lg space-y-5 text-bone/70">
            {paragrafos.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <p className="mt-8 font-display text-3xl italic text-brass-2">
            {c.assinatura}
          </p>

          {/* Mini-destaques */}
          <div className="mt-9 flex flex-wrap gap-10">
            {c.miniDestaques.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="font-display text-2xl text-bone">
                  {item.numero}
                </span>
                <span className="rule-brass" />
                <span className="eyebrow-light">{item.rotulo}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button href="/sobre" variant="ghost-light" size="md">
              Conheça a trajetória
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
