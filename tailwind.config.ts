import type { Config } from "tailwindcss";

/**
 * Sistema de design "coleção privada de imóveis".
 * As cores e fontes abaixo são os tokens oficiais do projeto — use sempre
 * estes nomes (ex.: `text-brass`, `bg-ink`, `font-display`) em vez de hex soltos.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#15171A", // fundo escuro / texto principal
          2: "#1E2227", // painéis escuros
          3: "#2A2F35", // bordas no escuro
        },
        brass: {
          DEFAULT: "#B8924A", // dourado fosco — acento (usar com parcimônia)
          2: "#D8B871", // dourado claro
        },
        bone: {
          DEFAULT: "#F5F1EA", // fundo creme
          2: "#EAE3D6", // creme secundário
        },
        stone: {
          DEFAULT: "#9A958B", // texto auxiliar
          d: "#6B675F", // texto auxiliar escuro
        },
        line: "#DED6C7", // filetes no claro
      },
      fontFamily: {
        // Definidas via next/font em src/app/layout.tsx
        display: ["var(--font-playfair)", "Georgia", "serif"],
        label: ["var(--font-jost)", "ui-sans-serif", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
        label: "0.18em",
      },
      maxWidth: {
        shell: "1240px",
        prose: "68ch",
      },
      boxShadow: {
        card: "0 18px 50px -28px rgba(21, 23, 26, 0.45)",
        "card-hover": "0 28px 70px -30px rgba(21, 23, 26, 0.55)",
        panel: "0 24px 80px -40px rgba(21, 23, 26, 0.65)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "hero-zoom": {
          "0%": { transform: "scale(1.001)" },
          "100%": { transform: "scale(1.09)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.9s ease both",
        "hero-zoom": "hero-zoom 8s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
