"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { HeroImagensUploader } from "@/components/admin/HeroImagensUploader";
import { IconCheck, IconUpload, IconTrash } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { IMAGENS } from "@/lib/constants";
import type { SiteConfig } from "@/lib/config-defaults";

type Estado = "idle" | "salvando" | "ok" | "erro";

/**
 * Edição das configurações do site (identidade + contato). Salva tudo de uma
 * vez em /api/configuracoes e dá router.refresh() para o site refletir.
 */
export function ConfiguracoesForm({ inicial }: { inicial: SiteConfig }) {
  const router = useRouter();
  const [dados, setDados] = useState<SiteConfig>(inicial);
  const [estado, setEstado] = useState<Estado>("idle");
  const [msg, setMsg] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFoto = useRef<HTMLInputElement>(null);

  const set = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) =>
    setDados((d) => ({ ...d, [k]: v }));

  // Atualiza um item das listas de estatísticas (numeros / miniDestaques).
  const setStat = (
    campo: "numeros" | "miniDestaques",
    i: number,
    chave: "numero" | "rotulo",
    v: string,
  ) =>
    setDados((d) => {
      const arr = d[campo].map((it, idx) =>
        idx === i ? { ...it, [chave]: v } : it,
      );
      return { ...d, [campo]: arr };
    });

  // Atualiza um passo do "como trabalho".
  const setPasso = (i: number, chave: "titulo" | "texto", v: string) =>
    setDados((d) => {
      const arr = d.passos.map((it, idx) =>
        idx === i ? { ...it, [chave]: v } : it,
      );
      return { ...d, passos: arr };
    });

  const fotoAtual = dados.retratoUrl || IMAGENS.retrato;
  const temFotoCustom = Boolean(
    dados.retratoUrl && dados.retratoUrl !== IMAGENS.retrato,
  );

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
      if (!res.ok || !j.urls?.[0]) {
        throw new Error(j.erro || "Falha no envio da imagem.");
      }
      set("retratoUrl", j.urls[0]);
    } catch (e) {
      setEstado("erro");
      setMsg(e instanceof Error ? e.message : "Falha no envio da imagem.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("salvando");
    setMsg("");
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const j = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) throw new Error(j.erro || "Não foi possível salvar.");
      setEstado("ok");
      setMsg("Configurações salvas. O site já reflete as alterações.");
      router.refresh();
    } catch (err) {
      setEstado("erro");
      setMsg(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-8">
      {/* Identidade */}
      <section className="panel p-6 sm:p-8">
        <h3 className="font-display text-xl text-ink">Marca &amp; identidade</h3>
        <p className="mt-1 text-sm text-stone-d">
          Nome, marca e credenciais exibidos no site (cabeçalho, rodapé,
          páginas).
        </p>

        {/* Foto do corretor — fonte única, aparece em todo o site */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-line bg-bone-2">
            <Image
              src={fotoAtual}
              alt="Foto do corretor"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="label text-[0.66rem] font-medium tracking-label text-stone-d">
              Foto do corretor
            </span>
            <span className="text-xs text-stone">
              Aparece no menu, na home, no contato e na página do imóvel.
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
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
              {temFotoCustom && (
                <button
                  type="button"
                  onClick={() => set("retratoUrl", "")}
                  className="label inline-flex items-center gap-1.5 text-[0.66rem] tracking-label text-stone-d transition-colors hover:text-red-600"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <Field label="Nome do corretor" htmlFor="cfg-nome">
            <Input
              id="cfg-nome"
              value={dados.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Guilherme Valim"
            />
          </Field>
          <Field
            label="Marca (logo)"
            htmlFor="cfg-marca"
            hint="A última palavra aparece em itálico dourado."
          >
            <Input
              id="cfg-marca"
              value={dados.marca}
              onChange={(e) => set("marca", e.target.value)}
              placeholder="Guilherme Valim"
            />
          </Field>
          <Field label="Subtítulo" htmlFor="cfg-sub">
            <Input
              id="cfg-sub"
              value={dados.subtitulo}
              onChange={(e) => set("subtitulo", e.target.value)}
              placeholder="Imóveis de Alto Padrão"
            />
          </Field>
          <Field
            label="Assinatura"
            htmlFor="cfg-ass"
            hint="Exibida em itálico no rodapé e no “sobre”."
          >
            <Input
              id="cfg-ass"
              value={dados.assinatura}
              onChange={(e) => set("assinatura", e.target.value)}
              placeholder="Guilherme Valim"
            />
          </Field>
          <Field label="CRECI" htmlFor="cfg-creci">
            <Input
              id="cfg-creci"
              value={dados.creci}
              onChange={(e) => set("creci", e.target.value)}
              placeholder="CRECI 00000-F"
            />
          </Field>
          <Field label="Região de atuação" htmlFor="cfg-regiao">
            <Input
              id="cfg-regiao"
              value={dados.regiao}
              onChange={(e) => set("regiao", e.target.value)}
              placeholder="Litoral Norte · Rio Grande do Sul"
            />
          </Field>
        </div>
      </section>

      {/* Contato */}
      <section className="panel p-6 sm:p-8">
        <h3 className="font-display text-xl text-ink">Contato</h3>
        <p className="mt-1 text-sm text-stone-d">
          Canais usados nos botões, no rodapé e na página de contato.
        </p>
        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="cfg-email">
            <Input
              id="cfg-email"
              type="email"
              value={dados.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contato@exemplo.com.br"
            />
          </Field>
          <Field label="Instagram" htmlFor="cfg-insta">
            <Input
              id="cfg-insta"
              value={dados.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              placeholder="@suamarca.imoveis"
            />
          </Field>
          <Field label="Telefone" htmlFor="cfg-tel">
            <PhoneInput
              id="cfg-tel"
              value={dados.telefone}
              onChange={(v) => set("telefone", v)}
            />
          </Field>
          <Field
            label="WhatsApp"
            htmlFor="cfg-zap"
            hint="Usado nos botões “Chamar no WhatsApp”."
          >
            <PhoneInput
              id="cfg-zap"
              value={dados.whatsapp}
              onChange={(v) => set("whatsapp", v)}
            />
          </Field>
          <Field label="Endereço" htmlFor="cfg-end" className="sm:col-span-2">
            <Input
              id="cfg-end"
              value={dados.endereco}
              onChange={(e) => set("endereco", e.target.value)}
              placeholder="Av. Beira Mar, 1200 — Capão da Canoa/RS"
            />
          </Field>
        </div>
      </section>

      {/* Conteúdo do site */}
      <section className="panel p-6 sm:p-8">
        <h3 className="font-display text-xl text-ink">Conteúdo do site</h3>
        <p className="mt-1 text-sm text-stone-d">
          Textos e números das páginas. Em títulos, escreva{" "}
          <code className="rounded-sm bg-bone-2 px-1 text-[0.85em]">
            *uma palavra*
          </code>{" "}
          entre asteriscos para destacá-la em dourado.
        </p>

        {/* Início (hero) */}
        <div className="mt-8">
          <span className="eyebrow">Início — topo (hero)</span>
          <div className="mt-4 grid gap-6">
            <Field
              label="Imagens do banner"
              hint="Várias imagens passam em sequência (crossfade) no topo do site. A 1ª é a que abre. Vazio = imagem padrão."
            >
              <HeroImagensUploader
                value={dados.heroImagens}
                onChange={(urls) => set("heroImagens", urls)}
              />
            </Field>
            <Field label="Rótulo (eyebrow)" htmlFor="c-he">
              <Input
                id="c-he"
                value={dados.heroEyebrow}
                onChange={(e) => set("heroEyebrow", e.target.value)}
              />
            </Field>
            <Field label="Título" htmlFor="c-ht" hint="Use *palavra* para o dourado.">
              <Input
                id="c-ht"
                value={dados.heroTitulo}
                onChange={(e) => set("heroTitulo", e.target.value)}
              />
            </Field>
            <Field label="Subtítulo" htmlFor="c-hs">
              <Textarea
                id="c-hs"
                rows={2}
                value={dados.heroSubtitulo}
                onChange={(e) => set("heroSubtitulo", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Números de autoridade */}
        <div className="mt-10">
          <span className="eyebrow">Números de destaque</span>
          <p className="mt-1 text-xs text-stone">
            Aparecem na faixa do início e na página “Sobre”.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {dados.numeros.map((n, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.4fr] gap-3">
                <Input
                  aria-label={`Número ${i + 1}`}
                  value={n.numero}
                  onChange={(e) => setStat("numeros", i, "numero", e.target.value)}
                  placeholder="18"
                />
                <Input
                  aria-label={`Rótulo ${i + 1}`}
                  value={n.rotulo}
                  onChange={(e) => setStat("numeros", i, "rotulo", e.target.value)}
                  placeholder="Anos de atuação"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mini-destaques (bloco sobre da home) */}
        <div className="mt-10">
          <span className="eyebrow">Mini-destaques — bloco “Sobre” do início</span>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {dados.miniDestaques.map((n, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Input
                  aria-label={`Destaque ${i + 1} — número`}
                  value={n.numero}
                  onChange={(e) =>
                    setStat("miniDestaques", i, "numero", e.target.value)
                  }
                  placeholder="100%"
                />
                <Input
                  aria-label={`Destaque ${i + 1} — rótulo`}
                  value={n.rotulo}
                  onChange={(e) =>
                    setStat("miniDestaques", i, "rotulo", e.target.value)
                  }
                  placeholder="Atendimento direto"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bloco "Sobre" do início */}
        <div className="mt-10">
          <span className="eyebrow">Bloco “Sobre” do início</span>
          <div className="mt-4 grid gap-6">
            <Field label="Título" htmlFor="c-st" hint="Use *palavra* para o dourado.">
              <Input
                id="c-st"
                value={dados.sobreTitulo}
                onChange={(e) => set("sobreTitulo", e.target.value)}
              />
            </Field>
            <Field
              label="Texto"
              htmlFor="c-sr"
              hint="Separe parágrafos com uma linha em branco."
            >
              <Textarea
                id="c-sr"
                rows={5}
                value={dados.sobreResumo}
                onChange={(e) => set("sobreResumo", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Biografia (página Sobre) */}
        <div className="mt-10">
          <span className="eyebrow">Biografia — página “Sobre”</span>
          <div className="mt-4">
            <Field
              label="Texto da biografia"
              htmlFor="c-bio"
              hint="Separe parágrafos com uma linha em branco."
            >
              <Textarea
                id="c-bio"
                rows={8}
                value={dados.bio}
                onChange={(e) => set("bio", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Como trabalho */}
        <div className="mt-10">
          <span className="eyebrow">Como trabalho — 3 etapas</span>
          <div className="mt-4 grid gap-5">
            {dados.passos.map((p, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[0.6fr_2fr]">
                <Input
                  aria-label={`Etapa ${i + 1} — título`}
                  value={p.titulo}
                  onChange={(e) => setPasso(i, "titulo", e.target.value)}
                  placeholder="Curadoria"
                />
                <Textarea
                  aria-label={`Etapa ${i + 1} — texto`}
                  rows={2}
                  value={p.texto}
                  onChange={(e) => setPasso(i, "texto", e.target.value)}
                  placeholder="Descrição da etapa…"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-10">
          <span className="eyebrow">Chamada final (CTA)</span>
          <div className="mt-4 grid gap-6">
            <Field label="Título" htmlFor="c-ct" hint="Use *palavra* para o dourado.">
              <Input
                id="c-ct"
                value={dados.ctaTitulo}
                onChange={(e) => set("ctaTitulo", e.target.value)}
              />
            </Field>
            <Field label="Texto" htmlFor="c-cx">
              <Textarea
                id="c-cx"
                rows={2}
                value={dados.ctaTexto}
                onChange={(e) => set("ctaTexto", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Rodapé: feedback + salvar (aplica a tudo acima) */}
      <div className="panel sticky bottom-4 z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 text-sm",
            estado === "ok" && "text-brass",
            estado === "erro" && "text-red-600",
            estado !== "ok" && estado !== "erro" && "text-stone-d",
          )}
        >
          {estado === "ok" && <IconCheck className="h-4 w-4 shrink-0" />}
          {estado === "ok" || estado === "erro"
            ? msg
            : "As alterações refletem no site após salvar."}
        </p>
        <Button type="submit" variant="primary" disabled={estado === "salvando"}>
          {estado === "salvando" ? "Salvando…" : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
