import { cn } from "@/lib/cn";

type Tom = "brass" | "ink" | "bone" | "stone" | "outline";

const tons: Record<Tom, string> = {
  brass: "bg-brass/15 text-brass border border-brass/30",
  ink: "bg-ink text-bone",
  bone: "bg-bone-2 text-ink-2",
  stone: "bg-stone/15 text-stone-d",
  outline: "border border-line text-stone-d",
};

/** Etiqueta pequena (tipo do imóvel, finalidade, status). */
export function Badge({
  children,
  tom = "outline",
  className,
}: {
  children: React.ReactNode;
  tom?: Tom;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label inline-flex items-center px-2.5 py-1 text-[0.62rem] font-medium tracking-label",
        tons[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
