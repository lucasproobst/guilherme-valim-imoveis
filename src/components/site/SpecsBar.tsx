import type { ImovelDTO } from "@/lib/types";
import { formatArea } from "@/lib/format";
import { SpecItem } from "@/components/site/SpecItem";
import {
  IconBed,
  IconBath,
  IconRuler,
  IconLand,
  IconCar,
} from "@/components/ui/icons";

/**
 * Faixa de especificações do imóvel (cartão claro).
 * Mostra apenas os atributos preenchidos — itens nulos/zero são omitidos.
 * Filetes verticais separam os itens; quebra em colunas no mobile.
 */
export function SpecsBar({ imovel }: { imovel: ImovelDTO }) {
  const itens = [
    imovel.suites > 0 && {
      key: "suites",
      icon: <IconBed className="h-5 w-5" />,
      valor: imovel.suites,
      label: "Suítes",
    },
    imovel.quartos > 0 && {
      key: "quartos",
      icon: <IconBed className="h-5 w-5" />,
      valor: imovel.quartos,
      label: "Quartos",
    },
    imovel.banheiros != null &&
      imovel.banheiros > 0 && {
        key: "banheiros",
        icon: <IconBath className="h-5 w-5" />,
        valor: imovel.banheiros,
        label: "Banheiros",
      },
    imovel.areaPrivativa != null &&
      imovel.areaPrivativa > 0 && {
        key: "areaPrivativa",
        icon: <IconRuler className="h-5 w-5" />,
        valor: formatArea(imovel.areaPrivativa).replace(" m²", ""),
        label: "m² privativos",
      },
    imovel.areaTerreno != null &&
      imovel.areaTerreno > 0 && {
        key: "areaTerreno",
        icon: <IconLand className="h-5 w-5" />,
        valor: formatArea(imovel.areaTerreno).replace(" m²", ""),
        label: "m² terreno",
      },
    imovel.vagas > 0 && {
      key: "vagas",
      icon: <IconCar className="h-5 w-5" />,
      valor: imovel.vagas,
      label: "Vagas",
    },
  ].filter(Boolean) as {
    key: string;
    icon: React.ReactNode;
    valor: React.ReactNode;
    label: string;
  }[];

  if (itens.length === 0) return null;

  return (
    <div className="panel grid grid-cols-2 gap-y-6 px-6 py-7 sm:grid-cols-3 sm:gap-y-7 md:flex md:items-center md:justify-between md:px-9">
      {itens.map((item, idx) => (
        <div
          key={item.key}
          className="flex items-center md:flex-1 md:justify-center"
        >
          {/* Filete vertical entre itens (a partir do segundo, em telas md+) */}
          {idx > 0 && (
            <span
              aria-hidden
              className="mr-6 hidden h-9 w-px bg-line md:block lg:mr-9"
            />
          )}
          <SpecItem icon={item.icon} valor={item.valor} label={item.label} />
        </div>
      ))}
    </div>
  );
}
