"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { parseVideoUrl, type VideoEmbed } from "@/lib/video";
import { IconX, IconPlay, IconVolume, IconVolumeOff } from "@/components/ui/icons";

/**
 * Tour em vídeo do imóvel.
 *
 * - `modoCliente` (site público): mostra uma miniatura clicável; ao clicar,
 *   abre um lightbox responsivo que cresce conforme o dispositivo. Sem barra de
 *   progresso (o visitante não consegue adiantar o vídeo).
 * - padrão (preview do painel): player completo com controles, para o corretor
 *   conferir o vídeo.
 */
export function VideoFrame({
  src,
  poster,
  className,
  label = "Tour em vídeo",
  modoCliente = false,
}: {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  modoCliente?: boolean;
}) {
  const video = parseVideoUrl(src);

  if (modoCliente) {
    return (
      <TourCliente
        src={src}
        poster={poster}
        className={className}
        label={label}
        video={video}
      />
    );
  }

  // Preview do painel — player nativo / iframe com controles (como antes).
  return (
    <Moldura className={className} label={label}>
      {video.tipo === "arquivo" ? (
        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full bg-ink object-contain"
        />
      ) : (
        <iframe
          src={video.embedUrl}
          title={label}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full bg-ink"
        />
      )}
    </Moldura>
  );
}

/* ------------------------------------------------------------------ *
 *  Moldura compartilhada (fundo escuro + colchetes dourados + selo)
 * ------------------------------------------------------------------ */
function Moldura({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-sm border border-ink-3 bg-ink p-2 shadow-panel sm:p-3",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[2px]">{children}</div>

      <span aria-hidden className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-brass/70 sm:left-4 sm:top-4" />
      <span aria-hidden className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r border-t border-brass/70 sm:right-4 sm:top-4" />
      <span aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b border-l border-brass/70 sm:bottom-4 sm:left-4" />
      <span aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-brass/70 sm:bottom-4 sm:right-4" />

      {label && (
        <figcaption className="label pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 bg-ink/70 px-3 py-1 text-[0.58rem] tracking-eyebrow text-brass-2 backdrop-blur-sm sm:top-6">
          {label}
        </figcaption>
      )}
    </figure>
  );
}

/** Acrescenta parâmetros que escondem os controles (sem barra de progresso). */
function embedSemControles(video: VideoEmbed): string {
  if (video.tipo === "arquivo") return "";
  const sep = video.embedUrl.includes("?") ? "&" : "?";
  if (video.tipo === "youtube") {
    return `${video.embedUrl}${sep}autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&fs=1`;
  }
  // vimeo
  return `${video.embedUrl}${sep}autoplay=1&controls=0&keyboard=0&title=0&byline=0&portrait=0&playsinline=1`;
}

/* ------------------------------------------------------------------ *
 *  Site público — miniatura clicável + lightbox sem barra de progresso
 * ------------------------------------------------------------------ */
function TourCliente({
  src,
  poster,
  className,
  label,
  video,
}: {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  video: VideoEmbed;
}) {
  const [aberto, setAberto] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [tocando, setTocando] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fechar = useCallback(() => setAberto(false), []);

  // Esc fecha + trava o scroll do fundo enquanto aberto.
  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [aberto, fechar]);

  // Dá play no arquivo ao abrir (o clique já é o gesto do usuário).
  useEffect(() => {
    if (aberto && video.tipo === "arquivo") {
      const v = videoRef.current;
      if (v) v.play().then(() => setTocando(true)).catch(() => setTocando(false));
    }
  }, [aberto, video.tipo]);

  function alternarPlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setTocando(true);
    } else {
      v.pause();
      setTocando(false);
    }
  }

  return (
    <>
      {/* Miniatura clicável */}
      <Moldura className={className} label={label}>
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Assistir ao tour em vídeo"
          className="relative block aspect-video w-full bg-ink"
        >
          {poster ? (
            <Image
              src={poster}
              alt="Tour em vídeo"
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover opacity-85 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-2xl italic text-brass/50">
              Guilherme Valim
            </span>
          )}
          <span className="absolute inset-0 bg-ink/30 transition-colors group-hover:bg-ink/20" />
          {/* Botão de play */}
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/30 bg-ink/55 text-bone backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-brass group-hover:text-brass sm:h-20 sm:w-20">
            <IconPlay className="ml-1 h-7 w-7 sm:h-8 sm:w-8" />
          </span>
        </button>
      </Moldura>

      {/* Lightbox — cresce conforme o dispositivo */}
      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
          onClick={fechar}
        >
          {/* Fechar */}
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar vídeo"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-brass hover:text-brass sm:right-6 sm:top-6"
          >
            <IconX className="h-5 w-5" />
          </button>

          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {video.tipo === "arquivo" ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={src}
                  autoPlay
                  playsInline
                  onClick={alternarPlay}
                  onContextMenu={(e) => e.preventDefault()}
                  controlsList="nodownload noplaybackrate"
                  className="max-h-[85vh] w-full bg-ink object-contain"
                />
                {/* Play central quando pausado */}
                {!tocando && (
                  <button
                    type="button"
                    onClick={alternarPlay}
                    aria-label="Reproduzir"
                    className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/30 bg-ink/55 text-bone backdrop-blur-sm transition-colors hover:border-brass hover:text-brass"
                  >
                    <IconPlay className="ml-1 h-7 w-7" />
                  </button>
                )}
                {/* Mudo/Som (única forma de controle de áudio — sem barra de progresso) */}
                <button
                  type="button"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    v.muted = !v.muted;
                    setMudo(v.muted);
                  }}
                  aria-label={mudo ? "Ativar som" : "Silenciar"}
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 bg-ink/55 text-bone backdrop-blur-sm transition-colors hover:border-brass hover:text-brass"
                >
                  {mudo ? (
                    <IconVolumeOff className="h-5 w-5" />
                  ) : (
                    <IconVolume className="h-5 w-5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="aspect-video w-full overflow-hidden rounded-sm bg-ink">
                <iframe
                  src={embedSemControles(video)}
                  title={label}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
