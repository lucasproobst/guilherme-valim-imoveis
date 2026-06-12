"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

/**
 * Formulário de acesso ao painel do corretor.
 * Posta em /api/auth/login e, em caso de sucesso, navega ao destino
 * solicitado (`next`) ou ao painel.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function aoEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (res.ok) {
        router.push(next || "/painel");
        router.refresh();
        return;
      }

      const json = (await res.json().catch(() => null)) as
        | { erro?: string }
        | null;
      setErro(json?.erro || "Não foi possível entrar. Tente novamente.");
    } catch {
      setErro("Falha de conexão. Verifique sua rede e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
      <Field label="E-mail" htmlFor="login-email" required>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="voce@guilhermevalim.com.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={erro ? true : undefined}
          required
        />
      </Field>

      <Field label="Senha" htmlFor="login-senha" required>
        <Input
          id="login-senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-invalid={erro ? true : undefined}
          required
        />
      </Field>

      {erro && (
        <p role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={carregando}
      >
        {carregando ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
