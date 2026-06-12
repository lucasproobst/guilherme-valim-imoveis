/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Uploads locais ficam em /public/uploads. Em produção, ao trocar por
    // Cloudinary/S3, adicione o domínio remoto aqui em `remotePatterns`.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" }, // Supabase Storage
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // As imagens-placeholder do seed/identidade são SVGs gerados por nós.
    // Seguro aqui: o upload do painel só aceita JPG/PNG/WEBP/AVIF (nunca SVG),
    // então nenhum SVG não-confiável passa pelo otimizador.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
