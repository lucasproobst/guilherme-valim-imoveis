import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rule } from "@/components/ui/Rule";
import { cn } from "@/lib/cn";

/**
 * Cabeçalho de seção do site: eyebrow dourado + título Playfair + filete.
 * `align` controla o alinhamento; `light` para fundos escuros.
 */
export function SectionHeading({
  eyebrow,
  titulo,
  descricao,
  align = "left",
  light = false,
  className,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const center = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        center && "items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          "max-w-2xl text-3xl leading-[1.1] sm:text-4xl md:text-[2.7rem]",
          light ? "text-bone" : "text-ink",
        )}
      >
        {titulo}
      </Heading>
      <Rule brass className={center ? "mx-auto" : ""} />
      {descricao && (
        <p
          className={cn(
            "max-w-prose text-[0.95rem] leading-relaxed",
            light ? "text-bone/70" : "text-stone-d",
          )}
        >
          {descricao}
        </p>
      )}
    </div>
  );
}
