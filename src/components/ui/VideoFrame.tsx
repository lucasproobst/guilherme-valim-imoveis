"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { parseVideoUrl, type VideoEmbed } from "@/lib/video";
import { IconPlay, IconVolume, IconVolumeOff } from "@/components/ui/icons";

/**
 * Tour em vídeo do imóvel.
 *
 * - `modoCliente` (site público): mostra uma miniatura clicável; ao clicar, o
 *   vídeo passa a tocar NO LUGAR (inline) — a página continua rolando normal,
 *   sem travar o scroll. Sem barra de progresso (o visitante não adianta).
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
    return `${video.embedUrl}${sep}autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3`;
  }
  // vimeo
  return `${video.embedUrl}${sep}autoplay=1&controls=0&keyboard=0&title=0&byline=0&portrait=0&playsinline=1`;
}

/* ------------------------------------------------------------------ *
 *  Site público — miniatura clicável que toca INLINE (sem travar scroll)
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
  const [iniciado, setIniciado] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [tocando, setTocando] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  function alternarPlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  // Antes de iniciar: miniatura com botão de play.
  if (!iniciado) {
    return (
      <Moldura className={className} label={label}>
        <button
          type="button"
          onClick={() => setIniciado(true)}
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
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/30 bg-ink/55 text-bone backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-brass group-hover:text-brass sm:h-20 sm:w-20">
            <IconPlay className="ml-1 h-7 w-7 sm:h-8 sm:w-8" />
          </span>
        </button>
      </Moldura>
    );
  }

  // Tocando inline — a página rola normalmente (sem overlay/scroll lock).
  return (
    <Moldura className={className} label={label}>
      {video.tipo === "arquivo" ? (
        <div className="relative">
          <video
            ref={videoRef}
            src={src}
            autoPlay
            playsInline
            onClick={alternarPlay}
            onPlay={() => setTocando(true)}
            onPause={() => setTocando(false)}
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload noplaybackrate"
            className="aspect-video w-full bg-ink object-contain"
          />
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
          <button
            type="button"
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              v.muted = !v.muted;
              setMudo(v.muted);
            }}
            aria-label={mudo ? "Ativar som" : "Silenciar"}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 bg-ink/55 text-bone backdrop-blur-sm transition-colors hover:border-brass hover:text-brass"
          >
            {mudo ? (
              <IconVolumeOff className="h-5 w-5" />
            ) : (
              <IconVolume className="h-5 w-5" />
            )}
          </button>
        </div>
      ) : (
        <iframe
          src={embedSemControles(video)}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full bg-ink"
        />
      )}
    </Moldura>
  );
}
