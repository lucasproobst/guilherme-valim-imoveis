/**
 * Gerador de imagens-placeholder em SVG para o seed e a identidade visual.
 *
 * Não dependemos de serviços externos: produzimos cenas vetoriais elegantes
 * (céu em gradiente com nuvens via feTurbulence, massas arquitetônicas, janelas
 * iluminadas, grão de filme) na paleta da marca. Crisp em qualquer tamanho e
 * 100% offline. A identidade visual é o que importa (conforme o briefing).
 *
 * Para trocar por fotos reais depois, basta substituir os arquivos em
 * /public/uploads/seed e /public/brand, ou subir fotos pelo painel.
 */

type Paleta = {
  ceu1: string;
  ceu2: string;
  brilho: string;
  massa: string;
  massa2: string;
  acento: string;
  base: string;
};

export const PALETAS: Record<string, Paleta> = {
  litoral: { ceu1: "#16252b", ceu2: "#436069", brilho: "#D8B871", massa: "#0f1518", massa2: "#1c2a30", acento: "#B8924A", base: "#0c1114" },
  noite: { ceu1: "#15171A", ceu2: "#3a3026", brilho: "#D8B871", massa: "#101216", massa2: "#23282e", acento: "#B8924A", base: "#0b0d0f" },
  bosque: { ceu1: "#1b271f", ceu2: "#52604a", brilho: "#E7D9B6", massa: "#121a14", massa2: "#202a20", acento: "#B8924A", base: "#0d130e" },
  urbano: { ceu1: "#1a1e24", ceu2: "#49525e", brilho: "#D8B871", massa: "#0f1318", massa2: "#222831", acento: "#B8924A", base: "#0b0e12" },
  areia: { ceu1: "#2a2317", ceu2: "#7a6a4a", brilho: "#F0E4C4", massa: "#1a1610", massa2: "#312a1d", acento: "#B8924A", base: "#13100a" },
  serra: { ceu1: "#171c24", ceu2: "#3f4a5c", brilho: "#CFE0EA", massa: "#0f131a", massa2: "#1f2630", acento: "#B8924A", base: "#0a0d12" },
};

type Cena = "fachada" | "living" | "vista" | "suite" | "retrato";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Janela iluminada (retângulo com luz quente). */
function janelas(
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  cor: string,
  opac = 0.85,
): string {
  const gx = w / cols;
  const gy = h / rows;
  let out = "";
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      // algumas janelas apagadas para parecer natural
      const acesa = (r * 7 + c * 3) % 5 !== 0;
      const o = acesa ? opac : 0.14;
      out += `<rect x="${(x + c * gx + gx * 0.3).toFixed(1)}" y="${(y + r * gy + gy * 0.28).toFixed(1)}" width="${(gx * 0.42).toFixed(1)}" height="${(gy * 0.46).toFixed(1)}" fill="${cor}" opacity="${o}" rx="1"/>`;
    }
  }
  return out;
}

/**
 * Gera o SVG de uma cena. `w`/`h` definem proporção (ex.: 1600x1200 = 4:3).
 */
export function gerarSVG(opts: {
  cena: Cena;
  paletaKey?: keyof typeof PALETAS;
  titulo?: string;
  lote?: string;
  w?: number;
  h?: number;
}): string {
  const { cena, titulo, lote } = opts;
  const w = opts.w ?? 1600;
  const h = opts.h ?? 1200;
  const p = PALETAS[opts.paletaKey ?? "litoral"];
  const id = `g${(opts.paletaKey ?? "x").toString()}${cena}`;

  const horizonte = Math.round(h * (cena === "vista" ? 0.62 : 0.58));

  // Defs: gradientes + filtros de nuvem e grão
  const defs = `
    <defs>
      <linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.ceu1}"/>
        <stop offset="100%" stop-color="${p.ceu2}"/>
      </linearGradient>
      <radialGradient id="${id}-sol" cx="76%" cy="30%" r="46%">
        <stop offset="0%" stop-color="${p.brilho}" stop-opacity="0.85"/>
        <stop offset="40%" stop-color="${p.brilho}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${p.brilho}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id}-base" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.massa2}"/>
        <stop offset="100%" stop-color="${p.base}"/>
      </linearGradient>
      <filter id="${id}-nuvem" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.014" numOctaves="4" seed="7" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.32 -0.08"/>
      </filter>
      <filter id="${id}-grao">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"/>
      </filter>
      <linearGradient id="${id}-scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="55%" stop-color="#0c0e10" stop-opacity="0"/>
        <stop offset="100%" stop-color="#0c0e10" stop-opacity="0.72"/>
      </linearGradient>
    </defs>`;

  let cenaSvg = "";

  if (cena === "living" || cena === "suite") {
    // Interior: parede em gradiente, grande janela com céu, piso, mobília sugerida
    const janelaW = w * 0.46;
    const janelaH = h * 0.5;
    const jx = w * (cena === "living" ? 0.46 : 0.08);
    const jy = h * 0.16;
    cenaSvg = `
      <rect width="${w}" height="${h}" fill="${p.massa2}"/>
      <rect width="${w}" height="${h}" fill="url(#${id}-base)" opacity="0.5"/>
      <!-- janela -->
      <rect x="${jx}" y="${jy}" width="${janelaW}" height="${janelaH}" fill="url(#${id}-ceu)"/>
      <rect x="${jx}" y="${jy}" width="${janelaW}" height="${janelaH}" fill="url(#${id}-sol)"/>
      <g filter="url(#${id}-nuvem)" opacity="0.5"><rect x="${jx}" y="${jy}" width="${janelaW}" height="${janelaH * 0.6}"/></g>
      <line x1="${jx + janelaW / 2}" y1="${jy}" x2="${jx + janelaW / 2}" y2="${jy + janelaH}" stroke="${p.base}" stroke-width="6"/>
      <rect x="${jx}" y="${jy}" width="${janelaW}" height="${janelaH}" fill="none" stroke="${p.acento}" stroke-width="3" opacity="0.5"/>
      <!-- piso -->
      <rect x="0" y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="${p.base}"/>
      <rect x="0" y="${h * 0.78}" width="${w}" height="3" fill="${p.acento}" opacity="0.4"/>
      <!-- mobília sugerida (sofá / cama) -->
      <rect x="${w * 0.1}" y="${h * 0.66}" width="${w * 0.34}" height="${h * 0.14}" rx="10" fill="${p.massa}" opacity="0.92"/>
      <rect x="${w * 0.1}" y="${h * 0.63}" width="${w * 0.34}" height="${h * 0.05}" rx="8" fill="${p.massa2}"/>
      <circle cx="${w * 0.78}" cy="${h * 0.5}" r="${h * 0.03}" fill="${p.brilho}" opacity="0.5"/>`;
  } else if (cena === "retrato") {
    // Retrato editorial: cabeça + ombros com luz de borda dourada (rim light)
    const cx = w / 2;
    cenaSvg = `
      <rect width="${w}" height="${h}" fill="${p.ceu1}"/>
      <radialGradient id="${id}-rl" cx="68%" cy="38%" r="60%">
        <stop offset="0%" stop-color="${p.brilho}" stop-opacity="0.5"/>
        <stop offset="55%" stop-color="${p.brilho}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${p.brilho}" stop-opacity="0"/>
      </radialGradient>
      <rect width="${w}" height="${h}" fill="url(#${id}-rl)"/>
      <g filter="url(#${id}-nuvem)" opacity="0.16"><rect width="${w}" height="${h}"/></g>
      <!-- figura: ombros + pescoço + cabeça -->
      <g fill="${p.base}">
        <path d="M ${(w * 0.13).toFixed(0)} ${h}
                 C ${(w * 0.17).toFixed(0)} ${(h * 0.64).toFixed(0)}, ${(w * 0.33).toFixed(0)} ${(h * 0.54).toFixed(0)}, ${cx.toFixed(0)} ${(h * 0.54).toFixed(0)}
                 C ${(w * 0.67).toFixed(0)} ${(h * 0.54).toFixed(0)}, ${(w * 0.83).toFixed(0)} ${(h * 0.64).toFixed(0)}, ${(w * 0.87).toFixed(0)} ${h} Z"/>
        <ellipse cx="${cx.toFixed(0)}" cy="${(h * 0.355).toFixed(0)}" rx="${(w * 0.135).toFixed(0)}" ry="${(h * 0.16).toFixed(0)}"/>
      </g>
      <!-- rim light dourada no contorno direito -->
      <path d="M ${(cx + w * 0.135).toFixed(0)} ${(h * 0.31).toFixed(0)}
               a ${(w * 0.135).toFixed(0)} ${(h * 0.16).toFixed(0)} 0 0 1 ${(-w * 0.02).toFixed(0)} ${(h * 0.26).toFixed(0)}"
            fill="none" stroke="${p.brilho}" stroke-width="3" opacity="0.55"/>
      <path d="M ${(w * 0.87).toFixed(0)} ${h}
               C ${(w * 0.82).toFixed(0)} ${(h * 0.66).toFixed(0)}, ${(w * 0.71).toFixed(0)} ${(h * 0.56).toFixed(0)}, ${(w * 0.6).toFixed(0)} ${(h * 0.55).toFixed(0)}"
            fill="none" stroke="${p.brilho}" stroke-width="3" opacity="0.32"/>`;
  } else if (cena === "vista") {
    // Panorama litorâneo ao entardecer: céu amplo, sol baixo, mar com caminho de luz
    const hor = Math.round(h * 0.66);
    cenaSvg = `
      <rect width="${w}" height="${h}" fill="url(#${id}-ceu)"/>
      <rect width="${w}" height="${hor}" fill="url(#${id}-sol)"/>
      <g filter="url(#${id}-nuvem)" opacity="0.3"><rect width="${w}" height="${(hor * 0.92).toFixed(0)}"/></g>
      <circle cx="${(w * 0.72).toFixed(0)}" cy="${(hor * 0.48).toFixed(0)}" r="${(h * 0.14).toFixed(0)}" fill="${p.brilho}" opacity="0.16"/>
      <circle cx="${(w * 0.72).toFixed(0)}" cy="${(hor * 0.48).toFixed(0)}" r="${(h * 0.055).toFixed(0)}" fill="${p.brilho}" opacity="0.6"/>
      <circle cx="${(w * 0.72).toFixed(0)}" cy="${(hor * 0.48).toFixed(0)}" r="${(h * 0.03).toFixed(0)}" fill="#FBF3DC" opacity="0.9"/>
      <!-- costa baixa de residências distantes -->
      <g fill="${p.massa}">
        <rect x="${(w * 0.03).toFixed(0)}" y="${(hor - h * 0.075).toFixed(0)}" width="${(w * 0.18).toFixed(0)}" height="${(h * 0.075).toFixed(0)}"/>
        <rect x="${(w * 0.23).toFixed(0)}" y="${(hor - h * 0.05).toFixed(0)}" width="${(w * 0.12).toFixed(0)}" height="${(h * 0.05).toFixed(0)}"/>
        <rect x="${(w * 0.37).toFixed(0)}" y="${(hor - h * 0.1).toFixed(0)}" width="${(w * 0.09).toFixed(0)}" height="${(h * 0.1).toFixed(0)}"/>
      </g>
      ${janelas(w * 0.03, hor - h * 0.075, w * 0.18, h * 0.075, 8, 2, p.brilho, 0.5)}
      ${janelas(w * 0.37, hor - h * 0.1, w * 0.09, h * 0.1, 3, 3, p.brilho, 0.5)}
      <!-- mar -->
      <rect x="0" y="${hor}" width="${w}" height="${h - hor}" fill="url(#${id}-base)"/>
      <line x1="0" y1="${hor}" x2="${w}" y2="${hor}" stroke="${p.acento}" stroke-width="2" opacity="0.5"/>
      <polygon points="${(w * 0.72).toFixed(0)},${hor} ${(w * 0.64).toFixed(0)},${h} ${(w * 0.8).toFixed(0)},${h}" fill="${p.brilho}" opacity="0.12"/>
      <g opacity="0.14" stroke="${p.brilho}" stroke-width="2">
        <line x1="${(w * 0.28).toFixed(0)}" y1="${hor + 60}" x2="${(w * 0.96).toFixed(0)}" y2="${hor + 60}"/>
        <line x1="${(w * 0.46).toFixed(0)}" y1="${hor + 150}" x2="${(w * 0.92).toFixed(0)}" y2="${hor + 150}"/>
        <line x1="${(w * 0.56).toFixed(0)}" y1="${hor + 260}" x2="${w}" y2="${hor + 260}"/>
      </g>`;
  } else {
    // Fachada: arquitetura próxima ao entardecer (janelas discretas)
    cenaSvg = `
      <rect width="${w}" height="${h}" fill="url(#${id}-ceu)"/>
      <rect width="${w}" height="${horizonte}" fill="url(#${id}-sol)"/>
      <g filter="url(#${id}-nuvem)" opacity="0.32"><rect width="${w}" height="${(horizonte * 0.85).toFixed(0)}"/></g>
      <circle cx="${(w * 0.78).toFixed(0)}" cy="${(horizonte * 0.32).toFixed(0)}" r="${(h * 0.05).toFixed(0)}" fill="${p.brilho}" opacity="0.5"/>
      <rect x="0" y="${horizonte}" width="${w}" height="${h - horizonte}" fill="url(#${id}-base)"/>
      <line x1="0" y1="${horizonte}" x2="${w}" y2="${horizonte}" stroke="${p.acento}" stroke-width="2" opacity="0.5"/>
      <g>
        <rect x="${(w * 0.08).toFixed(0)}" y="${(horizonte - h * 0.32).toFixed(0)}" width="${(w * 0.3).toFixed(0)}" height="${(h * 0.32).toFixed(0)}" fill="${p.massa}"/>
        ${janelas(w * 0.08, horizonte - h * 0.32, w * 0.3, h * 0.32, 7, 9, p.brilho, 0.5)}
        <rect x="${(w * 0.4).toFixed(0)}" y="${(horizonte - h * 0.2).toFixed(0)}" width="${(w * 0.22).toFixed(0)}" height="${(h * 0.2).toFixed(0)}" fill="${p.massa2}"/>
        ${janelas(w * 0.4, horizonte - h * 0.2, w * 0.22, h * 0.2, 5, 6, p.brilho, 0.38)}
        <rect x="${(w * 0.63).toFixed(0)}" y="${(horizonte - h * 0.42).toFixed(0)}" width="${(w * 0.2).toFixed(0)}" height="${(h * 0.42).toFixed(0)}" fill="${p.massa}"/>
        ${janelas(w * 0.63, horizonte - h * 0.42, w * 0.2, h * 0.42, 5, 12, p.brilho, 0.5)}
      </g>`;
  }

  // Texto (Lote + título) e moldura
  const overlay = `
    <rect width="${w}" height="${h}" fill="url(#${id}-scrim)"/>
    <g filter="url(#${id}-grao)" opacity="0.06"><rect width="${w}" height="${h}"/></g>
    <rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="none" stroke="${p.acento}" stroke-width="1.5" opacity="0.35"/>
    ${
      lote
        ? `<g>
             <rect x="40" y="40" width="${lote.length * 16 + 44}" height="46" fill="#15171A" opacity="0.55"/>
             <text x="62" y="72" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="28" fill="#F5F1EA">${esc(lote)}</text>
           </g>`
        : ""
    }
    ${
      titulo
        ? `<text x="40" y="${h - 54}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(w * 0.034)}" fill="#F5F1EA" opacity="0.96">${esc(titulo)}</text>
           <text x="42" y="${h - 24}" font-family="'Jost', system-ui, sans-serif" font-size="${Math.round(w * 0.014)}" letter-spacing="4" fill="#D8B871" opacity="0.85">GUILHERME VALIM · IMÓVEIS DE ALTO PADRÃO</text>`
        : ""
    }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(titulo ?? "Imóvel")}">${defs}${cenaSvg}${overlay}</svg>`;
}
