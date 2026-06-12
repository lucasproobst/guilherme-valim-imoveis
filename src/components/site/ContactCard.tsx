import Image from "next/image";
import type { ImovelDTO } from "@/lib/types";
import { getConfig } from "@/lib/config";
import { ContactForm } from "@/components/site/ContactForm";

/**
 * Cartão fixo de contato no detalhe do imóvel.
 * Apresenta o corretor e o formulário que já gera o lead vinculado ao imóvel.
 */
export async function ContactCard({ imovel }: { imovel: ImovelDTO }) {
  const c = await getConfig();
  return (
    <div className="panel p-7 sm:p-8">
      {/* Cabeçalho com o corretor */}
      <div className="flex items-center gap-4">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-line bg-ink-2">
          <Image
            src={c.retratoUrl}
            alt={`Retrato de ${c.nome}`}
            fill
            sizes="56px"
            className="object-cover"
          />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-lg text-ink">{c.nome}</span>
          <span className="label text-[0.6rem] tracking-label text-stone">
            {c.creci}
          </span>
        </div>
      </div>

      <span className="rule my-6 block" />

      <p className="font-display text-xl leading-snug text-ink">
        Agende uma <span className="accent-italic">visita</span>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-stone-d">
        Conheça este imóvel pessoalmente, no melhor horário para você.
      </p>

      <div className="mt-6">
        <ContactForm
          imovelId={imovel.id}
          imovelTitulo={imovel.titulo}
          origem="imovel"
          ctaLabel="Quero visitar este imóvel"
        />
      </div>
    </div>
  );
}
