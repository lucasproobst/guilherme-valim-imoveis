"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Banner rotativo da home: faz crossfade entre as imagens (com leve zoom
 * "ken burns" na ativa). Uma imagem só → estático. Respeita
 * prefers-reduced-motion (sem rotação nem zoom).
 */
const INTERVALO = 6500;

export function HeroCarousel({ imagens }: { imagens: string[] }) {
  const slides = imagens.length > 0 ? imagens : [];
  const [ativo, setAtivo] = useState(0);
  const [anima, setAnima] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduz =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setAnima(!reduz);
    if (reduz || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setAtivo((a) => (a + 1) % slides.length);
    }, INTERVALO);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {slides.map((src, i) => (
        <div
          key={`${i}-${src}`}
          aria-hidden={i !== ativo}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1400ms] ease-soft",
            i === ativo ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              "object-cover",
              // zoom "ken burns" só a partir de md — no mobile o scale faria a
              // imagem ultrapassar a viewport
              anima && i === ativo && "md:animate-hero-zoom",
            )}
          />
        </div>
      ))}

      {/* Indicadores (pontinhos) quando há mais de uma imagem */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para a imagem ${i + 1}`}
              onClick={() => setAtivo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === ativo ? "w-7 bg-brass-2" : "w-1.5 bg-bone/50 hover:bg-bone/80",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
