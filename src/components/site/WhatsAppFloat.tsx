"use client";

import { usePathname } from "next/navigation";
import { useConfig } from "@/lib/config-context";
import { IconWhatsApp } from "@/components/ui/icons";

/**
 * Botão flutuante de WhatsApp (canto inferior direito).
 * Usa o número configurado no painel e abre o WhatsApp com uma mensagem pronta.
 * Aparece só nas páginas públicas (escondido no painel e no login).
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const { whatsapp, nome } = useConfig();

  if (pathname?.startsWith("/painel") || pathname?.startsWith("/login")) {
    return null;
  }

  const numero = (whatsapp || "").replace(/\D/g, "");
  if (!numero) return null;

  const primeiroNome = (nome || "Guilherme").trim().split(/\s+/)[0];
  const mensagem = `Olá, ${primeiroNome}! Vim do seu site e gostaria de saber algumas informações.`;
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar com ${primeiroNome} no WhatsApp`}
      className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_-10px_rgba(37,211,102,0.7)] ring-1 ring-white/25 transition-transform duration-300 ease-soft hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      {/* anel pulsante sutil */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-40 motion-safe:animate-ping"
      />
      <IconWhatsApp className="h-7 w-7 sm:h-8 sm:w-8" />
    </a>
  );
}
