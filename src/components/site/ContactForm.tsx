"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { IconWhatsApp, IconCheck } from "@/components/ui/icons";
import { useConfig } from "@/lib/config-context";
import { linkWhatsApp } from "@/lib/format";

type Estado = "idle" | "enviando" | "ok" | "erro";

/**
 * Formulário de contato (gera um Lead no banco).
 * Reutilizado na página de contato e no card fixo do imóvel.
 */
export function ContactForm({
  imovelId,
  imovelTitulo,
  origem = "contato",
  escuro = false,
  ctaLabel = "Enviar mensagem",
}: {
  imovelId?: string;
  imovelTitulo?: string;
  origem?: "site" | "contato" | "imovel";
  escuro?: boolean;
  ctaLabel?: string;
}) {
  const config = useConfig();
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState("");

  const mensagemPadrao = imovelTitulo
    ? `Olá, ${config.nome}! Tenho interesse no imóvel "${imovelTitulo}". Podemos agendar uma visita?`
    : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setErro(null);

    const form = e.currentTarget;
    const dados = new FormData(form);
    const payload = {
      nome: String(dados.get("nome") || "").trim(),
      whatsapp: whatsapp.trim(),
      mensagem: String(dados.get("mensagem") || "").trim() || null,
      imovelId: imovelId ?? null,
      origem,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.erro || "Não foi possível enviar agora.");
      }
      setEstado("ok");
      form.reset();
      setWhatsapp("");
    } catch (err) {
      setEstado("erro");
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  const whatsappHref = linkWhatsApp(
    config.whatsapp,
    mensagemPadrao ||
      `Olá, ${config.nome}! Gostaria de mais informações sobre seus imóveis.`,
  );

  if (estado === "ok") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass">
          <IconCheck className="h-7 w-7" />
        </span>
        <p className={escuro ? "font-display text-2xl text-bone" : "font-display text-2xl text-ink"}>
          Mensagem enviada!
        </p>
        <p className={escuro ? "text-sm text-bone/60" : "text-sm text-stone-d"}>
          {config.nome} entrará em contato em breve pelo WhatsApp informado.
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="label mt-2 inline-flex items-center gap-2 text-[0.72rem] tracking-label text-brass hover:text-brass-2"
        >
          <IconWhatsApp className="h-4 w-4" /> Preferir, chame agora no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Nome" htmlFor="nome" required>
        <Input
          id="nome"
          name="nome"
          required
          escuro={escuro}
          placeholder="Seu nome completo"
          autoComplete="name"
        />
      </Field>

      <Field label="WhatsApp" htmlFor="whatsapp" required>
        <PhoneInput
          id="whatsapp"
          value={whatsapp}
          onChange={setWhatsapp}
          required
          escuro={escuro}
        />
      </Field>

      <Field label="Mensagem" htmlFor="mensagem">
        <Textarea
          id="mensagem"
          name="mensagem"
          escuro={escuro}
          rows={4}
          defaultValue={mensagemPadrao}
          placeholder="Conte o que procura ou a melhor data para a visita."
        />
      </Field>

      {erro && <p className="text-xs text-red-500">{erro}</p>}

      <div className="mt-1 flex flex-col gap-3">
        <Button type="submit" variant="primary" disabled={estado === "enviando"} className="w-full">
          {estado === "enviando" ? "Enviando…" : ctaLabel}
        </Button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="label inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[#25D366]/50 px-6 py-3.5 text-[0.72rem] tracking-label text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
        >
          <IconWhatsApp className="h-[18px] w-[18px]" />
          Chamar no WhatsApp
        </a>
      </div>

      <p className={escuro ? "text-center text-[0.7rem] text-bone/40" : "text-center text-[0.7rem] text-stone"}>
        Resposta em até 24h · Atendimento {config.regiao}
      </p>
    </form>
  );
}
