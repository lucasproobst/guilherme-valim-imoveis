"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { FotoDTO } from "@/lib/types";
import { formatLote } from "@/lib/format";
import { IconX, IconChevronLeft, IconChevronRight, IconPlus } from "@/components/ui/icons";

/**
 * Galeria do detalhe do imóvel.
 * Layout editorial: 1 foto principal (esquerda, ~2/3) + 2 menores (direita).
 * Clique em qualquer foto abre o lightbox (overlay fixo, ← → para navegar,
 * Esc para fechar, contador i / n). A tarja "Lote NN" assina a foto principal.
 *
 * `lote` chega já calculado do servidor (loteFromId) — este componente é client.
 */
export function Gallery({
  fotos,
  titulo,
  lote,
}: {
  fotos: FotoDTO[];
  titulo: string;
  lote: number;
}) {
  // índice da foto aberta no lightbox; null = fechado
  const [aberto, setAberto] = useState<number | null>(null);
  // a foto ampliada atual ainda está carregando? (mostra spinner, evita "tela vazia")
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  const total = fotos.length;

  const fechar = useCallback(() => setAberto(null), []);
  const proxima = useCallback(
    () => setAberto((i) => (i === null ? i : (i + 1) % total)),
    [total],
  );
  const anterior = useCallback(
    () => setAberto((i) => (i === null ? i : (i - 1 + total) % total)),
    [total],
  );

  // Ao abrir ou trocar de foto, volta ao estado "carregando" até a nova carregar.
  useEffect(() => {
    if (aberto !== null) setCarregandoFoto(true);
  }, [aberto]);

  // Navegação por teclado e trava de scroll enquanto o lightbox está aberto
  useEffect(() => {
    if (aberto === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowRight") proxima();
      else if (e.key === "ArrowLeft") anterior();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [aberto, fechar, proxima, anterior]);

  // Sem fotos: placeholder elegante com a marca
  if (total === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-sm border border-line bg-ink">
        <span className="font-display text-3xl italic text-brass/50">Guilherme Valim</span>
      </div>
    );
  }

  const principal = fotos[0];
  const secundarias = fotos.slice(1, 3);
  const extras = total - 3;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Foto principal — ocupa ~2/3 (2 de 3 colunas) */}
        <button
          type="button"
          onClick={() => setAberto(0)}
          aria-label={`Ampliar foto 1 de ${total} — ${titulo}`}
          className="group relative col-span-1 aspect-[4/3] overflow-hidden rounded-sm bg-ink-2 sm:col-span-2 sm:aspect-auto"
        >
          <Image
            src={principal.url}
            alt={`${titulo} — foto principal`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 66vw"
            className="object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="lote-tag">{formatLote(lote)}</span>
          <span className="photo-scrim absolute inset-x-0 bottom-0 h-1/4" aria-hidden />
        </button>

        {/* Coluna direita: até 2 fotos menores */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4">
          {secundarias.map((foto, idx) => {
            const indice = idx + 1;
            const ultima = idx === secundarias.length - 1;
            const mostrarMais = ultima && extras > 0;
            return (
              <button
                key={foto.id}
                type="button"
                onClick={() => setAberto(indice)}
                aria-label={`Ampliar foto ${indice + 1} de ${total} — ${titulo}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-ink-2"
              >
                <Image
                  src={foto.url}
                  alt={`${titulo} — foto ${indice + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                {/* Botão "+N fotos" sobre a última miniatura quando há mais */}
                {mostrarMais && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/65 backdrop-blur-sm">
                    <IconPlus className="h-5 w-5 text-brass-2" />
                    <span className="label text-[0.7rem] tracking-label text-bone">
                      {extras} {extras === 1 ? "foto" : "fotos"}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {aberto !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de fotos — ${titulo}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
          onClick={fechar}
        >
          {/* Topo: contador + fechar */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-8">
            <span className="label text-[0.72rem] tracking-label text-bone/70">
              {aberto + 1} / {total}
            </span>
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar galeria"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-brass hover:text-brass"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Seta anterior */}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                anterior();
              }}
              aria-label="Foto anterior"
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-brass hover:text-brass sm:left-6"
            >
              <IconChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Imagem ampliada */}
          <div
            className="relative mx-14 h-[72vh] w-[88vw] max-w-5xl sm:mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spinner enquanto a foto não terminou de carregar (evita parecer bug) */}
            {carregandoFoto && (
              <span
                className="absolute inset-0 z-[5] flex items-center justify-center"
                aria-hidden
              >
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-bone/25 border-t-brass" />
              </span>
            )}
            <Image
              key={aberto}
              src={fotos[aberto].url}
              alt={`${titulo} — foto ${aberto + 1} de ${total}`}
              fill
              sizes="88vw"
              className={`object-contain transition-opacity duration-300 ${
                carregandoFoto ? "opacity-0" : "opacity-100"
              }`}
              priority
              onLoad={() => setCarregandoFoto(false)}
            />
          </div>

          {/* Seta próxima */}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                proxima();
              }}
              aria-label="Próxima foto"
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-brass hover:text-brass sm:right-6"
            >
              <IconChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
