import type { Metadata, Viewport } from "next";
import { Playfair_Display, Jost, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
import { getConfig } from "@/lib/config";
import { ConfigProvider } from "@/lib/config-context";
import { RevealManager } from "@/components/ui/RevealManager";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import "./globals.css";

/* Tipografia do sistema de design (mapeada para variáveis CSS) */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Cor da barra do navegador no mobile (iOS/Android e navegadores in-app como
 * o do WhatsApp). Usa o tom escuro do hero para não aparecer aquela faixa creme
 * acima do cabeçalho (antes ela herdava o fundo creme da página).
 */
export const viewport: Viewport = {
  themeColor: "#15171A",
};

export async function generateMetadata(): Promise<Metadata> {
  const c = await getConfig();
  const tituloBase = `${c.marca} — ${c.subtitulo}`;
  const descricao = `Coleção privada de imóveis de alto padrão no ${c.regiao}. Curadoria, exclusividade e atendimento personalizado com ${c.nome}.`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: tituloBase, template: `%s · ${c.marca}` },
    description: descricao,
    keywords: [
      "imóveis de alto padrão",
      "casas de luxo",
      "litoral RS",
      c.nome,
      "imóveis exclusivos",
    ],
    authors: [{ name: c.nome }],
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: tituloBase,
      title: tituloBase,
      description: descricao,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${jost.variable} ${inter.variable}`}
    >
      <head>
        {/* Sem JS, nada fica escondido pelas animações de scroll */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body>
        <ConfigProvider config={config}>
          {children}
          <WhatsAppFloat />
        </ConfigProvider>
        <RevealManager />
      </body>
    </html>
  );
}
