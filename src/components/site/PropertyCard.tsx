"use client";

import Image from "next/image";
import Link from "next/link";
import type { ImovelCardDTO } from "@/lib/types";
import { formatArea, formatLote, formatPreco, linkWhatsApp } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { SpecItem } from "@/components/site/SpecItem";
import {
  IconBed,
  IconRuler,
  IconCar,
  IconArrowUpRight,
  IconWhatsApp,
} from "@/components/ui/icons";
import { useConfig } from "@/lib/config-context";
import { cn } from "@/lib/cn";

/**
 * Cartão de imóvel — peça reutilizada na home, na listagem e nos relacionados.
 * Foto grande como protagonista, "Lote NN" sobre tarja, specs no rodapé e
 * botão de WhatsApp com mensagem pronta específica daquele imóvel.
 */
export function PropertyCard({
  imovel,
  priority = false,
  className,
}: {
  imovel: ImovelCardDTO;
  priority?: boolean;
  className?: string;
}) {
  const { nome, whatsapp } = useConfig();
  const href = `/imoveis/${imovel.slug}`;
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(" · ");

  // Mensagem pronta para o WhatsApp, personalizada por imóvel.
  const primeiroNome = nome.trim().split(/\s+/)[0] || nome;
  const mensagem = `Olá, ${primeiroNome}! Tenho interesse no imóvel "${imovel.titulo}"${
    imovel.cidade ? `, em ${imovel.cidade}` : ""
  }. Poderia me passar mais informações?`;
  const whatsappHref = linkWhatsApp(whatsapp, mensagem);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-white shadow-card transition-all duration-500 ease-soft hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Foto + Lote + tags */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-ink-2">
        {imovel.capaUrl ? (
          <Image
            src={imovel.capaUrl}
            alt={imovel.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1240px) 33vw, 380px"
            priority={priority}
            className="object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink">
            <span className="font-display text-2xl italic text-brass/50">Guilherme Valim</span>
          </div>
        )}

        <span className="lote-tag">{formatLote(imovel.lote)}</span>

        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {imovel.destaque && <Badge tom="brass">Destaque</Badge>}
          <Badge tom="ink">{imovel.finalidade}</Badge>
        </div>

        {/* scrim suave na base da foto */}
        <span className="photo-scrim absolute inset-x-0 bottom-0 h-1/3" aria-hidden />
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow truncate">{local}</span>
          <span className="label text-[0.6rem] tracking-label text-stone">
            {imovel.tipo}
          </span>
        </div>

        <Link href={href}>
          <h3 className="mt-3 font-display text-[1.35rem] leading-snug text-ink transition-colors group-hover:text-brass">
            {imovel.titulo}
          </h3>
        </Link>

        <p className="mt-2 font-display text-lg text-ink">
          {formatPreco(imovel.preco)}
          {imovel.finalidade === "Locação" && (
            <span className="text-sm text-stone"> /mês</span>
          )}
        </p>

        <div className="mt-auto pt-5">
          <span className="rule mb-4 block" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4">
              {imovel.suites > 0 && (
                <SpecItem
                  icon={<IconBed className="h-[18px] w-[18px]" />}
                  valor={imovel.suites}
                  label="Suítes"
                />
              )}
              {imovel.quartos > 0 && (
                <SpecItem
                  icon={<IconBed className="h-[18px] w-[18px]" />}
                  valor={imovel.quartos}
                  label="Quartos"
                />
              )}
              {imovel.areaPrivativa != null && (
                <SpecItem
                  icon={<IconRuler className="h-[18px] w-[18px]" />}
                  valor={formatArea(imovel.areaPrivativa).replace(" m²", "")}
                  label="m² priv."
                />
              )}
              {imovel.vagas > 0 && (
                <SpecItem
                  icon={<IconCar className="h-[18px] w-[18px]" />}
                  valor={imovel.vagas}
                  label="Vagas"
                />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* WhatsApp com mensagem pronta deste imóvel */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Falar sobre ${imovel.titulo} no WhatsApp`}
                title="Falar no WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#25D366]/45 text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
              >
                <IconWhatsApp className="h-[18px] w-[18px]" />
              </a>

              <Link
                href={href}
                aria-label={`Ver ${imovel.titulo}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-stone-d transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-ink"
              >
                <IconArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
