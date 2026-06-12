"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import {
  IconCheck,
  IconKey,
  IconPlus,
  IconTrash,
  IconUser,
  IconX,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
};

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

export function UsuariosManager({
  usuarios,
  currentId,
}: {
  usuarios: Usuario[];
  currentId: string;
}) {
  const router = useRouter();

  // ---- Novo usuário ----
  const [novo, setNovo] = useState({ nome: "", email: "", senha: "" });
  const [estadoNovo, setEstadoNovo] = useState<Estado>("idle");
  const [msgNovo, setMsgNovo] = useState("");

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setEstadoNovo("salvando");
    setMsgNovo("");
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível criar o usuário.");
      setEstadoNovo("ok");
      setMsgNovo(`Usuário "${novo.nome}" criado. Já pode acessar o painel.`);
      setNovo({ nome: "", email: "", senha: "" });
      router.refresh();
    } catch (err) {
      setEstadoNovo("erro");
      setMsgNovo(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Criar novo usuário */}
      <section className="panel p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-brass/12 text-brass">
            <IconPlus className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-display text-xl text-ink">Novo usuário</h2>
            <p className="text-sm text-stone-d">
              Crie uma conta de acesso ao painel.
            </p>
          </div>
        </div>

        <form onSubmit={criar} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="novo-nome" required>
              <Input
                id="novo-nome"
                value={novo.nome}
                onChange={(e) => setNovo((n) => ({ ...n, nome: e.target.value }))}
                placeholder="Nome do usuário"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="E-mail" htmlFor="novo-email" required>
              <Input
                id="novo-email"
                type="email"
                value={novo.email}
                onChange={(e) =>
                  setNovo((n) => ({ ...n, email: e.target.value }))
                }
                placeholder="email@exemplo.com"
                autoComplete="off"
                required
              />
            </Field>
          </div>
          <Field
            label="Senha"
            htmlFor="novo-senha"
            hint="Mínimo de 6 caracteres."
            required
          >
            <Input
              id="novo-senha"
              type="text"
              value={novo.senha}
              onChange={(e) => setNovo((n) => ({ ...n, senha: e.target.value }))}
              placeholder="Senha de acesso"
              autoComplete="new-password"
              required
            />
          </Field>

          <Aviso estado={estadoNovo} mensagem={msgNovo} />

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={estadoNovo === "salvando"}>
              <IconPlus className="h-4 w-4" />
              {estadoNovo === "salvando" ? "Criando…" : "Criar usuário"}
            </Button>
          </div>
        </form>
      </section>

      {/* Lista de usuários */}
      <section className="panel p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">
          Usuários com acesso
          <span className="ml-2 text-sm font-normal text-stone">
            ({usuarios.length})
          </span>
        </h2>

        <ul className="mt-6 divide-y divide-line">
          {usuarios.map((u) => (
            <UsuarioRow
              key={u.id}
              usuario={u}
              ehVoce={u.id === currentId}
              ultimo={usuarios.length <= 1}
              onMudou={() => router.refresh()}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function UsuarioRow({
  usuario,
  ehVoce,
  ultimo,
  onMudou,
}: {
  usuario: Usuario;
  ehVoce: boolean;
  ultimo: boolean;
  onMudou: () => void;
}) {
  const [abrirSenha, setAbrirSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [msg, setMsg] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (novaSenha.length < 6) {
      setEstado("erro");
      setMsg("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setEstado("salvando");
    try {
      const res = await fetch(`/api/admins/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: novaSenha }),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível trocar a senha.");
      setEstado("ok");
      setMsg("Senha atualizada.");
      setNovaSenha("");
      setTimeout(() => {
        setAbrirSenha(false);
        setEstado("idle");
      }, 1400);
    } catch (err) {
      setEstado("erro");
      setMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  async function excluir() {
    if (
      !window.confirm(
        `Remover o acesso de "${usuario.nome}" (${usuario.email})? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setExcluindo(true);
    try {
      const res = await fetch(`/api/admins/${usuario.id}`, {
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-bone-2 text-stone-d">
          <IconUser className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-display text-ink">
            <span className="truncate">{usuario.nome}</span>
            {ehVoce && (
              <span className="label rounded-full border border-brass/30 bg-brass/10 px-2 py-0.5 text-[0.6rem] font-medium tracking-label text-brass">
                Você
              </span>
            )}
          </p>
          <p className="truncate text-sm text-stone-d">{usuario.email}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAbrirSenha((v) => !v);
              setEstado("idle");
              setMsg("");
              setNovaSenha("");
            }}
            className="label inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-[0.66rem] font-medium tracking-label text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
          >
            {abrirSenha ? (
              <IconX className="h-3.5 w-3.5" />
            ) : (
              <IconKey className="h-3.5 w-3.5" />
            )}
            {abrirSenha ? "Cancelar" : "Trocar senha"}
          </button>

          <button
            type="button"
            onClick={excluir}
            disabled={ehVoce || ultimo || excluindo}
            title={
              ehVoce
                ? "Você não pode excluir o próprio usuário"
                : ultimo
                  ? "Não é possível excluir o último usuário"
                  : "Excluir usuário"
            }
            className="label inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-[0.66rem] font-medium tracking-label text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-stone disabled:hover:border-line disabled:hover:bg-transparent"
          >
            <IconTrash className="h-3.5 w-3.5" />
            {excluindo ? "Removendo…" : "Excluir"}
          </button>
        </div>
      </div>

      {/* Form de troca de senha (inline) */}
      {abrirSenha && (
        <form
          onSubmit={trocarSenha}
          className="mt-4 rounded-sm border border-line bg-bone-2/60 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field
              label="Nova senha"
              htmlFor={`senha-${usuario.id}`}
              hint="Mínimo de 6 caracteres."
              className="flex-1"
            >
              <Input
                id={`senha-${usuario.id}`}
                type="text"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Defina a nova senha"
                autoComplete="new-password"
              />
            </Field>
            <Button
              type="submit"
              size="sm"
              disabled={estado === "salvando"}
              className="shrink-0"
            >
              {estado === "salvando" ? "Salvando…" : "Salvar senha"}
            </Button>
          </div>
          <Aviso estado={estado} mensagem={msg} />
        </form>
      )}
    </li>
  );
}
