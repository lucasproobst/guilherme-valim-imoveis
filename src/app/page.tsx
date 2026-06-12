import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { AuthorityStrip } from "@/components/site/AuthorityStrip";
import { AboutPreview } from "@/components/site/AboutPreview";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Button } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/icons";
import { getImoveisDestaque } from "@/lib/queries";

// Consulta o banco a cada requisição — destaques mudam conforme o painel.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destaques = await getImoveisDestaque(3);

  return (
    <>
      {/* Header transparente sobre o hero (apenas na home) */}
      <Header transparent />

      <main>
        <Hero />
        <AuthorityStrip />

        {/* Seleção da semana */}
        <section className="bg-bone py-24 md:py-32">
          <div className="shell">
            <div className="reveal flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Seleção da semana"
                titulo={
                  <>
                    Imóveis em <i className="accent-italic">destaque</i>
                  </>
                }
                descricao="Uma amostra rotativa da coleção — endereços escolhidos pela qualidade da construção, pela localização e pela história que carregam."
              />

              <Button
                href="/imoveis"
                variant="link"
                className="shrink-0 self-start sm:self-auto"
              >
                Ver todo o portfólio
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {destaques.length > 0 ? (
              <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {destaques.map((imovel, i) => (
                  <div
                    key={imovel.id}
                    className="reveal"
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    <PropertyCard imovel={imovel} priority={i === 0} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-14 max-w-prose text-stone-d">
                Novos endereços estão sendo preparados. Fale conosco para
                conhecer oportunidades ainda fora do portfólio público.
              </p>
            )}
          </div>
        </section>

        <AboutPreview />
        <CtaBand />
      </main>

      <Footer />
    </>
  );
}
