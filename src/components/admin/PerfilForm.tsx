"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { IconUpload, IconCheck, IconTrash } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type DadosPerfil = {
  nome: string;
  email: string;
  creci: string;
  telefone: string;
  bio: string;
  avatarUrl: string | null;
};

type Estado = "idle" | "salvando" | "ok" | "erro";

/** Banner de feedback (sucesso/erro) reutilizado nas duas seções. */
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

export function PerfilForm({
  inicial,
  avatarFallback,
}: {
  inicial: DadosPerfil;
  avatarFallback: string;
}) {
  const router = useRouter();

  // --- Dados cadastrais ---
  const [dados, setDados] = useState<DadosPerfil>(inicial);
  const [estado, setEstado] = useState<Estado>("idle");
  const [msg, setMsg] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFoto = useRef<HTMLInputElement>(null);

  const set = <K extends keyof DadosPerfil>(k: K, v: DadosPerfil[K]) =>
    setDados((d) => ({ ...d, [k]: v }));

  async function enviarFoto(file: File) {
    setEnviandoFoto(true);
    setEstado("idle");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as {
        urls?: string[];
        erro?: string;
      };
      if (!res.ok) throw new Error(j.erro || "Falha no envio da imagem.");
      const url = j.urls?.[0];
      if (!url) throw new Error("Falha no envio da imagem.");
      set("avatarUrl", url);
    } catch (e) {
      setEstado("erro");
      setMsg(e instanceof Error ? e.message : "Falha no envio da imagem.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvarDados(e: React.FormEvent) {
    e.preventDefault();
    setEstado("salvando");
    setMsg("");
    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível salvar.");
      setEstado("ok");
      setMsg("Perfil atualizado com sucesso.");
      router.refresh(); // atualiza o cartão de identidade e a sidebar
    } catch (err) {
      setEstado("erro");
      setMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  // --- Senha ---
  const [senhas, setSenhas] = useState({ atual: "", nova: "", confirmar: "" });
  const [estadoSenha, setEstadoSenha] = useState<Estado>("idle");
  const [msgSenha, setMsgSenha] = useState("");

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsgSenha("");
    if (senhas.nova.length < 6) {
      setEstadoSenha("erro");
      setMsgSenha("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (senhas.nova !== senhas.confirmar) {
      setEstadoSenha("erro");
      setMsgSenha("A confirmação não confere com a nova senha.");
      return;
    }
    setEstadoSenha("salvando");
    try {
      const res = await fetch("/api/perfil/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual: senhas.atual, novaSenha: senhas.nova }),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível trocar a senha.");
      setEstadoSenha("ok");
      setMsgSenha("Senha alterada com sucesso.");
      setSenhas({ atual: "", nova: "", confirmar: "" });
    } catch (err) {
      setEstadoSenha("erro");
      setMsgSenha(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  const avatarSrc = dados.avatarUrl || avatarFallback;

  return (
    <div className="space-y-10">
      {/* Dados cadastrais */}
      <form onSubmit={salvarDados} className="panel p-6 sm:p-8">
        <h3 className="font-display text-xl text-ink">Dados cadastrais</h3>
        <p className="mt-1 text-sm text-stone-d">
          Estas informações aparecem no painel e como referência do corretor.
        </p>

        {/* Avatar */}
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-line bg-bone-2">
            <Image
              src={avatarSrc}
              alt="Retrato do corretor"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputFoto}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) enviarFoto(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => inputFoto.current?.click()}
              disabled={enviandoFoto}
            >
              <IconUpload className="h-4 w-4" />
              {enviandoFoto ? "Enviando…" : "Trocar foto"}
            </Button>
            {dados.avatarUrl && (
              <button
                type="button"
                onClick={() => set("avatarUrl", null)}
                className="label inline-flex items-center gap-1.5 text-[0.66rem] tracking-label text-stone-d transition-colors hover:text-red-600"
              >
                <IconTrash className="h-3.5 w-3.5" />
                Remover
              </button>
            )}
          </div>
        </div>

        {/* Campos */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Field label="Nome" htmlFor="nome" required>
            <Input
              id="nome"
              value={dados.nome}
              onChange={(e) => set("nome", e.target.value)}
              required
              autoComplete="name"
            />
          </Field>
          <Field label="E-mail" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={dados.email}
              onChange={(e) => set("email", e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          <Field label="CRECI" htmlFor="creci">
            <Input
              id="creci"
              value={dados.creci}
              onChange={(e) => set("creci", e.target.value)}
              placeholder="CRECI 00000-F"
            />
          </Field>
          <Field label="Telefone / WhatsApp" htmlFor="telefone">
            <PhoneInput
              id="telefone"
              value={dados.telefone}
              onChange={(v) => set("telefone", v)}
            />
          </Field>
          <Field
            label="Bio"
            htmlFor="bio"
            className="sm:col-span-2"
            hint="Apresentação curta exibida como referência do corretor."
          >
            <Textarea
              id="bio"
              value={dados.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={4}
            />
          </Field>
        </div>

        <Aviso estado={estado} mensagem={msg} />

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={estado === "salvando"}>
            {estado === "salvando" ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </form>

      {/* Senha de acesso */}
      <form onSubmit={salvarSenha} className="panel p-6 sm:p-8">
        <h3 className="font-display text-xl text-ink">Senha de acesso</h3>
        <p className="mt-1 text-sm text-stone-d">
          Para alterar, confirme a senha atual e defina uma nova.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Field label="Senha atual" htmlFor="senha-atual" required>
            <Input
              id="senha-atual"
              type="password"
              value={senhas.atual}
              onChange={(e) => setSenhas((s) => ({ ...s, atual: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </Field>
          <Field label="Nova senha" htmlFor="senha-nova" required>
            <Input
              id="senha-nova"
              type="password"
              value={senhas.nova}
              onChange={(e) => setSenhas((s) => ({ ...s, nova: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirmar nova senha" htmlFor="senha-conf" required>
            <Input
              id="senha-conf"
              type="password"
              value={senhas.confirmar}
              onChange={(e) =>
                setSenhas((s) => ({ ...s, confirmar: e.target.value }))
              }
              required
              autoComplete="new-password"
            />
          </Field>
        </div>

        <Aviso estado={estadoSenha} mensagem={msgSenha} />

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant="dark"
            disabled={estadoSenha === "salvando"}
          >
            {estadoSenha === "salvando" ? "Alterando…" : "Alterar senha"}
          </Button>
        </div>
      </form>
    </div>
  );
}
