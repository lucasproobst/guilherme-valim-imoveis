import type { ImovelDTO } from "@/lib/types";
import { SectionHeading } from "@/components/site/SectionHeading";
import { IconMapPin } from "@/components/ui/icons";

/**
 * Mapa do imóvel (Google Maps embed).
 * Prioriza coordenadas (lat/lng); na ausência, usa o endereço textual.
 * Não renderiza nada se não houver localização alguma.
 */
export function MapEmbed({ imovel }: { imovel: ImovelDTO }) {
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
  const enderecoTexto =
    imovel.endereco || local || imovel.cidade || null;

  // Define a query do embed: coordenadas têm prioridade
  let src: string | null = null;
  if (imovel.lat != null && imovel.lng != null) {
    src = `https://www.google.com/maps?q=${imovel.lat},${imovel.lng}&z=15&output=embed`;
  } else if (enderecoTexto) {
    src = `https://www.google.com/maps?q=${encodeURIComponent(
      enderecoTexto,
    )}&z=14&output=embed`;
  }

  if (!src) return null;

  return (
    <div className="flex flex-col gap-7">
      <SectionHeading eyebrow="Onde fica" titulo="Localização" />

      {enderecoTexto && (
        <p className="flex items-start gap-2.5 text-[0.95rem] text-stone-d">
          <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
          <span>{enderecoTexto}</span>
        </p>
      )}

      <div className="aspect-video w-full overflow-hidden rounded-sm border border-line">
        <iframe
          src={src}
          title={`Localização de ${imovel.titulo} no mapa`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}
