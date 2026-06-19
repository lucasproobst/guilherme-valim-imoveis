/**
 * Detecção do tipo de vídeo a partir da URL salva em `videoUrl`.
 * Aceita 3 formas:
 *  - YouTube  → embed via iframe (sem limite de tamanho, sem problema de codec)
 *  - Vimeo    → embed via iframe
 *  - arquivo  → URL direta (upload no Storage ou outro host) → <video>
 *
 * Resolve dois problemas do upload direto: o teto de 50 MB do bucket free e
 * vídeos de iPhone (.mov/HEVC) que ficam "pretos sem som" no navegador.
 */

export type VideoEmbed =
  | { tipo: "youtube" | "vimeo"; embedUrl: string }
  | { tipo: "arquivo"; embedUrl: null };

export function parseVideoUrl(url: string): VideoEmbed {
  const u = (url ?? "").trim();

  // YouTube: watch?v=ID · youtu.be/ID · /embed/ID · /shorts/ID · /live/ID
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
  );
  if (yt) {
    return {
      tipo: "youtube",
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
    };
  }

  // Vimeo: vimeo.com/ID · player.vimeo.com/video/ID
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d{4,})/i);
  if (vm) {
    return {
      tipo: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vm[1]}`,
    };
  }

  return { tipo: "arquivo", embedUrl: null };
}

/** É um link de plataforma (YouTube/Vimeo) — embed por iframe? */
export function ehLinkEmbed(url: string): boolean {
  return parseVideoUrl(url).tipo !== "arquivo";
}
