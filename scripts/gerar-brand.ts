/**
 * Gera os SVGs de identidade da marca em /public/brand.
 * Rode com: `npm run gen:imagens` (executado também no postinstall).
 */
import { promises as fs } from "fs";
import path from "path";
import { gerarSVG } from "../prisma/imagens";

const DESTINO = path.join(process.cwd(), "public", "brand");

const ARQUIVOS: { nome: string; svg: string }[] = [
  {
    nome: "hero.svg",
    svg: gerarSVG({ cena: "vista", paletaKey: "litoral", w: 2400, h: 1500 }),
  },
  {
    nome: "retrato.svg",
    svg: gerarSVG({ cena: "retrato", paletaKey: "noite", w: 900, h: 1120 }),
  },
  {
    nome: "sobre.svg",
    svg: gerarSVG({ cena: "fachada", paletaKey: "serra", w: 2000, h: 1300 }),
  },
  {
    nome: "contato.svg",
    svg: gerarSVG({ cena: "vista", paletaKey: "noite", w: 1200, h: 1500 }),
  },
  {
    nome: "cta.svg",
    svg: gerarSVG({ cena: "fachada", paletaKey: "areia", w: 2400, h: 1200 }),
  },
];

async function main() {
  await fs.mkdir(DESTINO, { recursive: true });
  for (const a of ARQUIVOS) {
    await fs.writeFile(path.join(DESTINO, a.nome), a.svg, "utf8");
    console.log(`✓ public/brand/${a.nome}`);
  }
  console.log("Imagens da marca geradas.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
