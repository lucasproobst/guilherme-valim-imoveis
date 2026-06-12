import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { realce } from "@/components/ui/realce";
import { getConfig } from "@/lib/config";

/**
 * Faixa de chamada para ação ao fim da home — fundo creme (bone-2),
 * centralizada e com bastante respiro. Convida ao contato direto.
 */
export async function CtaBand() {
  const c = await getConfig();
  const primeiroNome = c.nome.trim().split(/\s+/)[0];
  return (
    <section className="bg-bone-2 py-24 md:py-32">
      <div className="reveal shell flex flex-col items-center text-center">
        <Eyebrow>Conversa reservada</Eyebrow>

        <h2 className="mt-6 max-w-2xl font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
          {realce(c.ctaTitulo)}
        </h2>

        <p className="mt-6 max-w-lg text-stone-d">{c.ctaTexto}</p>

        <div className="mt-10">
          <Button href="/contato" variant="primary" size="lg">
            Falar com {primeiroNome}
          </Button>
        </div>
      </div>
    </section>
  );
}
