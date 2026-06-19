import { cn } from "@/lib/cn";
import { parseVideoUrl } from "@/lib/video";

/**
 * Moldura moderna para o tour em vídeo do imóvel.
 * Fundo escuro, cantos com colchetes dourados e player. Para YouTube/Vimeo usa
 * iframe (sem limite de tamanho, sem problema de codec); para arquivos diretos
 * usa o player nativo. Presentacional; reutilizado no painel e no site.
 */
export function VideoFrame({
  src,
  poster,
  className,
  label = "Tour em vídeo",
}: {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
}) {
  const video = parseVideoUrl(src);

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-sm border border-ink-3 bg-ink p-2 shadow-panel sm:p-3",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[2px]">
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
      </div>

      {/* Colchetes dourados nos cantos */}
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
