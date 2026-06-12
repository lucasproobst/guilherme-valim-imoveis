import { cn } from "@/lib/cn";

/** Rótulo dourado em Jost, maiúsculas, bem espaçado — acima dos títulos. */
export function Eyebrow({
  children,
  light = false,
  className,
}: {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(light ? "eyebrow-light" : "eyebrow", "block", className)}>
      {children}
    </span>
  );
}
