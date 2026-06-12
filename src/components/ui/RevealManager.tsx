"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Observa elementos com a classe `.reveal` e adiciona `.is-visible` quando
 * entram na viewport (animação de scroll). Montado uma vez no layout raiz.
 * Re-escaneia a cada navegação. Respeita prefers-reduced-motion e ausência de
 * IntersectionObserver (mostra tudo imediatamente).
 */
export function RevealManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduz =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let io: IntersectionObserver | null = null;

    // pequeno atraso p/ garantir que o DOM da rota nova já está montado
    const t = window.setTimeout(() => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"),
      );

      if (reduz || !("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );

      els.forEach((el) => io!.observe(el));
    }, 60);

    return () => {
      window.clearTimeout(t);
      io?.disconnect();
    };
  }, [pathname]);

  return null;
}
