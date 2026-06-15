import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { VersiculoDoDia } from "@/components/site/VersiculoDoDia";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rule } from "@/components/ui/Rule";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import { IMAGENS } from "@/lib/constants";
import { getConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A curadoria por trás de cada endereço. Conheça o corretor e o método de atendimento por trás da coleção privada de imóveis de alto padrão no litoral do Rio Grande do Sul.",
};

export const dynamic = "force-dynamic";

export default async function SobrePage() {
  const c = await getConfig();
  const bioParagrafos = c.bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <SiteShell>
      {/* ABERTURA EDITORIAL — texto + retrato vertical */}
      <section className="shell py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col gap-6 animate-fade-up">
            <Eyebrow>Sobre</Eyebrow>
            <h1 className="max-w-xl text-4xl leading-[1.08] text-ink sm:text-5xl md:text-[3.4rem]">
              A curadoria por trás de cada{" "}
              <span className="accent-italic">endereço</span>
            </h1>
            <Rule brass />
            <p className="max-w-prose text-base leading-relaxed text-stone-d">
              {c.marca} não é uma vitrine. É uma coleção privada,
              montada um imóvel de cada vez, para quem entende que comprar
              alto padrão é, antes de tudo, uma decisão de confiança.
            </p>
            <p className="max-w-prose text-[0.95rem] leading-relaxed text-stone-d">
              O litoral norte do Rio Grande do Sul tem endereços que nunca
              chegam aos portais. É exatamente neles que o nosso trabalho
              começa.
            </p>
          </div>

          <div className="reveal reveal-right relative aspect-[4/5] overflow-hidden rounded-sm border border-line">
            <Image
              src={IMAGENS.sobre}
              alt="Ambiente de um imóvel da coleção Guilherme Valim"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
            <span className="photo-scrim-top absolute inset-0" aria-hidden />
          </div>
        </div>
      </section>

      {/* BIOGRAFIA — retrato + texto sobre Guilherme Valim */}
      <section className="bg-bone-2/60 py-20 md:py-28">
        <div className="shell">
          <div className="grid items-start gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div className="reveal reveal-left relative aspect-[4/5] overflow-hidden rounded-sm border border-line">
              <Image
                src={c.retratoUrl}
                alt={`Retrato de ${c.nome}`}
                fill
                sizes="(min-width: 768px) 38vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="reveal reveal-right flex flex-col gap-6">
              <Eyebrow>Quem atende você</Eyebrow>
              <h2 className="max-w-xl text-3xl leading-[1.12] text-ink sm:text-4xl">
                {c.nome}, corretor de{" "}
                <span className="accent-italic">imóveis</span> de alto padrão
              </h2>
              <Rule brass />
              {bioParagrafos.map((p, i) => (
                <p
                  key={i}
                  className="max-w-prose text-[0.95rem] leading-relaxed text-stone-d"
                >
                  {p}
                </p>
              ))}

              <p className="mt-2 font-display text-2xl italic text-brass">
                {c.assinatura}
              </p>
              <span className="label text-[0.6rem] tracking-label text-stone">
                {c.creci} · {c.regiao}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAIXA — Como trabalho (3 passos numerados) */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="O método"
          titulo={
            <>
              Como <span className="accent-italic">trabalho</span>
            </>
          }
          descricao="Três etapas que transformam a busca por um imóvel em uma experiência de curadoria — do primeiro contato à entrega das chaves."
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-3">
          {c.passos.map((passo, i) => (
            <li
              key={i}
              className="reveal flex flex-col gap-5 bg-bone p-8 md:p-10"
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span className="font-display text-3xl italic text-brass">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Rule brass />
              <h3 className="text-xl text-ink">{passo.titulo}</h3>
              <p className="text-[0.9rem] leading-relaxed text-stone-d">
                {passo.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* PALAVRA DO DIA — versículo (troca diariamente) */}
      <VersiculoDoDia variant="sobre" />

      {/* CTA FINAL */}
      <section className="shell py-20 text-center md:py-28">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <Eyebrow>O próximo passo</Eyebrow>
          <h2 className="text-3xl leading-[1.12] text-ink sm:text-4xl">
            Conte o que você procura. O endereço{" "}
            <span className="accent-italic">certo</span> talvez já esteja na
            coleção.
          </h2>
          <Rule brass className="mx-auto" />
          <p className="max-w-prose text-[0.95rem] leading-relaxed text-stone-d">
            Uma conversa reservada é o ponto de partida para encontrar — ou
            anunciar — um imóvel à altura.
          </p>
          <Button href="/contato" variant="primary" size="lg" className="mt-2">
            Falar com {c.nome.split(" ")[0]}
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
