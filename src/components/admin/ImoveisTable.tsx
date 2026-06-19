"use client";

/**
 * Tabela de imóveis do painel.
 * Desktop: tabela editorial com filete dourado; Mobile: cartões empilhados.
 * Ações por linha (editar, publicar/despublicar, excluir) chamam a API e,
 * em caso de sucesso, atualizam a lista via router.refresh().
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconTrash,
} from "@/components/ui/icons";
import { formatPreco } from "@/lib/format";
import type { ImovelDTO } from "@/lib/types";

/** Foto de capa: a marcada como capa ou, na ausência, a primeira. */
function capaDe(imovel: ImovelDTO): string | null {
  const capa = imovel.fotos.find((f) => f.capa) ?? imovel.fotos[0] ?? null;
  return capa?.url ?? null;
}

export function ImoveisTable({ imoveis }: { imoveis: ImovelDTO[] }) {
  const router = useRouter();
  // id do imóvel cuja ação está em andamento (desabilita os botões da linha)
  const [processando, setProcessando] = useState<string | null>(null);

  async function alternarPublicacao(imovel: ImovelDTO) {
    setProcessando(imovel.id);
    try {
      const res = await fetch(`/api/imoveis/${imovel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicado: !imovel.publicado }),
      });
      if (res.ok) router.refresh();
    } finally {
      setProcessando(null);
    }
  }

  async function excluir(imovel: ImovelDTO) {
    const confirmado = window.confirm(
      `Excluir definitivamente "${imovel.titulo}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmado) return;
    setProcessando(imovel.id);
    try {
      const res = await fetch(`/api/imoveis/${imovel.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setProcessando(null);
    }
  }

  if (imoveis.length === 0) {
    return (
      <div className="panel flex flex-col items-center px-8 py-20 text-center">
        <span className="eyebrow">Acervo vazio</span>
        <h2 className="mt-4 font-display text-2xl text-ink">
          Nenhum imóvel cadastrado
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-d">
          Comece a montar a seleção publicando a primeira propriedade do
          portfólio.
        </p>
        <div className="mt-8">
          <Button href="/painel/imoveis/novo" variant="primary" size="md">
            <IconPlus className="h-4 w-4" />
            Novo imóvel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ---------- Desktop: tabela ---------- */}
      <div className="panel hidden overflow-hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-bone-2/50">
              <th className="label px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                Imóvel
              </th>
              <th className="label w-44 px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                Categoria
              </th>
              <th className="label w-44 px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                Valor
              </th>
              <th className="label w-36 px-6 py-4 text-[0.62rem] font-medium tracking-label text-stone-d">
                Situação
              </th>
              <th className="label w-36 px-6 py-4 text-right text-[0.62rem] font-medium tracking-label text-stone-d">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {imoveis.map((imovel) => {
              const capa = capaDe(imovel);
              const ocupado = processando === imovel.id;
              return (
                <tr
                  key={imovel.id}
                  className="group border-b border-line/70 transition-colors last:border-0 hover:bg-bone-2/30"
                >
                  {/* Capa + título + cidade */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-sm bg-bone-2">
                        {capa ? (
                          <Image
                            src={capa}
                            alt={imovel.titulo}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-label text-stone">
                            Sem foto
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-base text-ink">
                          {imovel.titulo}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-stone-d">
                          {[imovel.bairro, imovel.cidade]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tipo + finalidade */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tom="ink">{imovel.tipo}</Badge>
                      <Badge tom="outline">{imovel.finalidade}</Badge>
                    </div>
                  </td>

                  {/* Preço */}
                  <td className="whitespace-nowrap px-6 py-4 font-display text-base text-ink">
                    {formatPreco(imovel.preco)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {imovel.publicado ? (
                      <Badge tom="brass">Publicado</Badge>
                    ) : (
                      <Badge tom="stone">Rascunho</Badge>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/painel/imoveis/editar/${imovel.id}`}
                        aria-label={`Editar ${imovel.titulo}`}
                        title="Editar"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-stone-d transition-colors hover:bg-ink hover:text-bone"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => alternarPublicacao(imovel)}
                        disabled={ocupado}
                        aria-label={
                          imovel.publicado
                            ? `Despublicar ${imovel.titulo}`
                            : `Publicar ${imovel.titulo}`
                        }
                        title={imovel.publicado ? "Ocultar do site" : "Publicar"}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-stone-d transition-colors hover:bg-brass hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {imovel.publicado ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(imovel)}
                        disabled={ocupado}
                        aria-label={`Excluir ${imovel.titulo}`}
                        title="Excluir"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-stone-d transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- Mobile: cartões ---------- */}
      <div className="space-y-4 lg:hidden">
        {imoveis.map((imovel) => {
          const capa = capaDe(imovel);
          const ocupado = processando === imovel.id;
          return (
            <article key={imovel.id} className="panel overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm bg-bone-2">
                  {capa ? (
                    <Image
                      src={capa}
                      alt={imovel.titulo}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-label text-stone">
                      Sem foto
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-display text-base text-ink">
                      {imovel.titulo}
                    </p>
                    {imovel.publicado ? (
                      <Badge tom="brass">Publicado</Badge>
                    ) : (
                      <Badge tom="stone">Rascunho</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-stone-d">
                    {[imovel.bairro, imovel.cidade]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tom="ink">{imovel.tipo}</Badge>
                    <Badge tom="outline">{imovel.finalidade}</Badge>
                  </div>
                  <p className="mt-2 font-display text-base text-ink">
                    {formatPreco(imovel.preco)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-line bg-bone-2/30 px-3 py-2">
                <Link
                  href={`/painel/imoveis/editar/${imovel.id}`}
                  aria-label={`Editar ${imovel.titulo}`}
                  className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-[0.66rem] uppercase tracking-label text-stone-d transition-colors hover:bg-ink hover:text-bone"
                >
                  <IconEdit className="h-4 w-4" />
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => alternarPublicacao(imovel)}
                  disabled={ocupado}
                  aria-label={
                    imovel.publicado
                      ? `Despublicar ${imovel.titulo}`
                      : `Publicar ${imovel.titulo}`
                  }
                  className="inline-flex items-center gap-2 rounded-sm px-3 py-2 text-[0.66rem] uppercase tracking-label text-stone-d transition-colors hover:bg-brass hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {imovel.publicado ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                  {imovel.publicado ? "Ocultar" : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => excluir(imovel)}
                  disabled={ocupado}
                  aria-label={`Excluir ${imovel.titulo}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-stone-d transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
