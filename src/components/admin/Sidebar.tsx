"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useConfig } from "@/lib/config-context";
import type { AdminSession } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import {
  IconGrid,
  IconHome,
  IconUsers,
  IconCalendar,
  IconUser,
  IconSettings,
  IconKey,
  IconLogout,
  IconMenu,
  IconX,
} from "@/components/ui/icons";

/**
 * Navegação lateral do painel do corretor.
 * Desktop: coluna fixa (sticky, altura total) sobre fundo ink.
 * Mobile: barra superior fixa com botão hambúrguer que abre um drawer.
 */

type ItemNav = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => JSX.Element;
};

type Grupo = {
  rotulo: string;
  itens: ItemNav[];
};

const GRUPOS: Grupo[] = [
  {
    rotulo: "Gestão",
    itens: [
      { href: "/painel", label: "Visão geral", icon: IconGrid },
      { href: "/painel/imoveis", label: "Imóveis", icon: IconHome },
      { href: "/painel/leads", label: "Leads & contatos", icon: IconUsers },
      { href: "/painel/agenda", label: "Agenda de visitas", icon: IconCalendar },
    ],
  },
  {
    rotulo: "Conta",
    itens: [
      { href: "/painel/perfil", label: "Meu perfil", icon: IconUser },
      { href: "/painel/configuracoes", label: "Configurações", icon: IconSettings },
    ],
  },
  {
    rotulo: "Sistema",
    itens: [
      { href: "/painel/painel-dev", label: "Usuários & acessos", icon: IconKey },
    ],
  },
];

/** Marca um item como ativo (rota exata ou subrota, exceto a raiz /painel). */
function isAtivo(pathname: string, href: string): boolean {
  if (href === "/painel") return pathname === "/painel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ sessao }: { sessao: AdminSession }) {
  const pathname = usePathname();
  const router = useRouter();
  const { retratoUrl } = useConfig();
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setSaindo(false);
    }
  }

  // Conteúdo compartilhado entre desktop (coluna) e mobile (drawer).
  const conteudo = (
    <div className="dark-section flex h-full flex-col bg-ink text-bone">
      {/* Topo: marca */}
      <div className="border-b border-ink-3 px-6 py-7">
        <Logo tone="light" href="/painel" />
        <p className="eyebrow-light mt-4">Painel do corretor</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-4 py-7 no-scrollbar" aria-label="Navegação do painel">
        {GRUPOS.map((grupo) => (
          <div key={grupo.rotulo} className="mb-8 last:mb-0">
            <p className="eyebrow-light px-3">{grupo.rotulo}</p>
            <ul className="mt-3 space-y-1">
              {grupo.itens.map((item) => {
                const ativo = isAtivo(pathname, item.href);
                const Icone = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setAberto(false)}
                      aria-current={ativo ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-300 ease-soft",
                        ativo
                          ? "bg-brass/12 text-brass-2"
                          : "text-bone/70 hover:bg-bone/5 hover:text-bone",
                      )}
                    >
                      {/* Barra dourada do item ativo */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brass transition-opacity duration-300",
                          ativo ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Icone
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors",
                          ativo ? "text-brass" : "text-bone/55 group-hover:text-bone/80",
                        )}
                      />
                      <span className="label text-[0.72rem] font-medium tracking-label">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé: perfil + sair */}
      <div className="border-t border-ink-3 p-4">
        <div className="flex items-center gap-3 px-2">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brass/30">
            <Image
              src={retratoUrl}
              alt={sessao.nome}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm text-bone">
              {sessao.nome}
            </span>
            <span className="block truncate text-xs text-bone/55">{sessao.email}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={sair}
          disabled={saindo}
          className="label mt-4 flex w-full items-center justify-center gap-2 rounded-sm border border-bone/20 px-4 py-2.5 text-[0.68rem] font-medium tracking-label text-bone/80 transition-colors duration-300 ease-soft hover:border-bone/50 hover:text-bone disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconLogout className="h-4 w-4" />
          {saindo ? "Saindo…" : "Sair"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Coluna fixa — desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        {conteudo}
      </aside>

      {/* Topbar fixa — mobile */}
      <div className="dark-section sticky top-0 z-40 flex items-center justify-between border-b border-ink-3 bg-ink px-4 py-3 text-bone lg:hidden">
        <Logo tone="light" href="/painel" />
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu do painel"
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-bone/20 text-bone transition-colors hover:border-bone/50"
        >
          <IconMenu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer — mobile */}
      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
          />
          {/* Painel deslizante */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-2xl">
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar menu"
              className="dark-section absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-sm text-bone/80 transition-colors hover:text-bone"
            >
              <IconX className="h-5 w-5" />
            </button>
            {conteudo}
          </div>
        </div>
      )}
    </>
  );
}
