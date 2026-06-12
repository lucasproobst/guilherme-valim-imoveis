import { getConfig } from "@/lib/config";
import { cn } from "@/lib/cn";

/**
 * Faixa de provas de autoridade.
 * Sobe sobre a base do hero (margem negativa) com fundo ink translúcido,
 * backdrop-blur e filetes dourados separando os itens.
 * Grid 2x2 no mobile, 4 colunas no desktop.
 */
export async function AuthorityStrip() {
  const c = await getConfig();
  const PROVAS = c.numeros;
  return (
    <section
      className="dark-section relative z-20 -mt-24 sm:-mt-28"
      aria-label="Números e credenciais"
    >
      <div className="reveal shell">
        <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-brass/25 bg-ink/70 backdrop-blur-md lg:grid-cols-4">
          {PROVAS.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center justify-center gap-2 px-5 py-9 text-center sm:py-11",
                // filetes dourados internos entre os itens
                "border-brass/20",
                i % 2 === 0 && "border-r",
                i < 2 && "border-b lg:border-b-0",
                "lg:border-b-0",
                i !== 0 && "lg:border-l",
              )}
            >
              <span className="font-display text-3xl text-brass-2 sm:text-4xl">
                {item.numero}
              </span>
              <span className="eyebrow-light">{item.rotulo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
