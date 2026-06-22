"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import {
  IconCheck,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { CondominioDTO } from "@/lib/types";

type Estado = "idle" | "salvando" | "ok" | "erro";

function Aviso({ estado, mensagem }: { estado: Estado; mensagem: string }) {
  if (estado !== "ok" && estado !== "erro") return null;
  const ok = estado === "ok";
  return (
    <p
      role="status"
      className={cn(
        "mt-4 flex items-center gap-2 rounded-sm border px-4 py-3 text-sm",
        ok
          ? "border-brass/30 bg-brass/10 text-brass"
          : "border-red-300 bg-red-50 text-red-700",
      )}
    >
      {ok && <IconCheck className="h-4 w-4 shrink-0" />}
      {mensagem}
    </p>
  );
}

export function CondominiosManager({
  condominios,
}: {
  condominios: CondominioDTO[];
}) {
  const router = useRouter();

  const [novo, setNovo] = useState({ nome: "", cidade: "" });
  const [estado, setEstado] = useState<Estado>("idle");
  const [msg, setMsg] = useState("");

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("salvando");
    setMsg("");
    try {
      const res = await fetch("/api/condominios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível criar.");
      setEstado("ok");
      setMsg(`Condomínio "${novo.nome.trim()}" adicionado.`);
      setNovo({ nome: "", cidade: "" });
      router.refresh();
      setTimeout(() => setEstado("idle"), 1800);
    } catch (err) {
      setEstado("erro");
      setMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Novo condomínio */}
      <section className="panel p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-brass/12 text-brass">
            <IconPlus className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-xl text-ink">Novo condomínio</h2>
            <p className="text-sm text-stone-d">
              Aparece na lista ao cadastrar imóveis e no filtro do site.
            </p>
          </div>
        </div>

        <form onSubmit={criar} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="novo-condo-nome" required>
              <Input
                id="novo-condo-nome"
                value={novo.nome}
                onChange={(e) => setNovo((n) => ({ ...n, nome: e.target.value }))}
                placeholder="Ex.: Condado de Capão"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Cidade (opcional)" htmlFor="novo-condo-cidade">
              <Input
                id="novo-condo-cidade"
                value={novo.cidade}
                onChange={(e) =>
                  setNovo((n) => ({ ...n, cidade: e.target.value }))
                }
                placeholder="Ex.: Capão da Canoa"
                autoComplete="off"
              />
            </Field>
          </div>

          <Aviso estado={estado} mensagem={msg} />

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={estado === "salvando"}>
              <IconPlus className="h-4 w-4" />
              {estado === "salvando" ? "Adicionando…" : "Adicionar"}
            </Button>
          </div>
        </form>
      </section>

      {/* Lista */}
      <section className="panel p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">
          Condomínios cadastrados
          <span className="ml-2 text-sm font-normal text-stone">
            ({condominios.length})
          </span>
        </h2>

        {condominios.length === 0 ? (
          <p className="mt-6 text-sm text-stone-d">
            Nenhum condomínio cadastrado ainda. Adicione o primeiro acima.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {condominios.map((c) => (
              <CondominioRow
                key={c.id}
                condominio={c}
                onMudou={() => router.refresh()}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CondominioRow({
  condominio,
  onMudou,
}: {
  condominio: CondominioDTO;
  onMudou: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(condominio.nome);
  const [cidade, setCidade] = useState(condominio.cidade ?? "");
  const [estado, setEstado] = useState<Estado>("idle");
  const [msg, setMsg] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("salvando");
    setMsg("");
    try {
      const res = await fetch(`/api/condominios/${condominio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cidade }),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível salvar.");
      setEditando(false);
      setEstado("idle");
      onMudou();
    } catch (err) {
      setEstado("erro");
      setMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function excluir() {
    if (
      !window.confirm(
        `Excluir o condomínio "${condominio.nome}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setExcluindo(true);
    try {
      const res = await fetch(`/api/condominios/${condominio.id}`, {
        method: "DELETE",
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível excluir.");
      onMudou();
    } catch (err) {
      setExcluindo(false);
      window.alert(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      {editando ? (
        <form onSubmit={salvar} className="rounded-sm border border-line bg-bone-2/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome" htmlFor={`nome-${condominio.id}`} required>
              <Input
                id={`nome-${condominio.id}`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Field>
            <Field label="Cidade (opcional)" htmlFor={`cidade-${condominio.id}`}>
              <Input
                id={`cidade-${condominio.id}`}
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </Field>
          </div>
          <Aviso estado={estado} mensagem={msg} />
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditando(false);
                setNome(condominio.nome);
                setCidade(condominio.cidade ?? "");
                setEstado("idle");
              }}
            >
              <IconX className="h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={estado === "salvando"}>
              <IconCheck className="h-4 w-4" />
              {estado === "salvando" ? "Salvando…" : "Salvar"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-ink">{condominio.nome}</p>
            {condominio.cidade && (
              <p className="truncate text-sm text-stone-d">{condominio.cidade}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="label inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-[0.66rem] font-medium tracking-label text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
            >
              <IconEdit className="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              type="button"
              onClick={excluir}
              disabled={excluindo}
              className="label inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-[0.66rem] font-medium tracking-label text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconTrash className="h-3.5 w-3.5" />
              {excluindo ? "Removendo…" : "Excluir"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
