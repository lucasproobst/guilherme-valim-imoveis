"use client";

/**
 * Formulário de cadastro/edição de imóvel — a tela-vitrine do painel.
 * Layout em duas colunas: à esquerda o formulário em seções editoriais;
 * à direita uma pré-visualização "viva" do cartão (sticky).
 *
 * Estado controlado de todos os campos do ImovelInput. Em edição, inicializa
 * a partir do imóvel recebido. O submit monta o payload e faz POST (novo) ou
 * PUT /api/imoveis/[id] (edição).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Rule } from "@/components/ui/Rule";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconCheck } from "@/components/ui/icons";
import { TIPOS_IMOVEL, FINALIDADES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { ImovelDTO } from "@/lib/types";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DiferenciaisPicker } from "@/components/admin/DiferenciaisPicker";
import { LivePreview } from "@/components/admin/LivePreview";
import { VideoUploader } from "@/components/admin/VideoUploader";

type Foto = { url: string; ordem: number; capa: boolean };

/* Campo numérico controlado: guarda string vazia como "sem valor". */
function paraNumero(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* Cabeçalho de seção do formulário (eyebrow + título + filete). */
function SecaoTitulo({
  numero,
  eyebrow,
  titulo,
}: {
  numero: string;
  eyebrow: string;
  titulo: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm italic text-brass">{numero}</span>
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="font-display text-2xl text-ink">{titulo}</h2>
      <Rule brass />
    </div>
  );
}

/* Interruptor (toggle) acessível para publicar/destaque. */
function Toggle({
  ativo,
  onChange,
  titulo,
  descricao,
}: {
  ativo: boolean;
  onChange: (v: boolean) => void;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      onClick={() => onChange(!ativo)}
      className={cn(
        "flex items-center justify-between gap-4 rounded-sm border px-4 py-3.5 text-left transition-colors duration-200",
        ativo ? "border-brass bg-brass/10" : "border-line bg-white hover:border-ink/30",
      )}
    >
      <span className="flex flex-col">
        <span className="label text-[0.66rem] font-medium tracking-label text-ink">
          {titulo}
        </span>
        <span className="mt-0.5 text-xs text-stone-d">{descricao}</span>
      </span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
          ativo ? "bg-brass" : "bg-stone/40",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200",
            ativo ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function ImovelForm({ imovel }: { imovel?: ImovelDTO }) {
  const router = useRouter();
  const editando = Boolean(imovel);

  /* ---- estado controlado (inicializa do imóvel ou usa defaults) ---- */
  const [titulo, setTitulo] = useState(imovel?.titulo ?? "");
  const [tipo, setTipo] = useState(imovel?.tipo ?? "Casa");
  const [finalidade, setFinalidade] = useState(imovel?.finalidade ?? "Venda");
  const [preco, setPreco] = useState<number | null>(imovel?.preco ?? null);
  const [condominio, setCondominio] = useState<number | null>(
    imovel?.condominio ?? null,
  );

  const [cidade, setCidade] = useState(imovel?.cidade ?? "");
  const [bairro, setBairro] = useState(imovel?.bairro ?? "");
  const [endereco, setEndereco] = useState(imovel?.endereco ?? "");
  const [lat, setLat] = useState<number | null>(imovel?.lat ?? null);
  const [lng, setLng] = useState<number | null>(imovel?.lng ?? null);

  const [suites, setSuites] = useState<number>(imovel?.suites ?? 0);
  const [banheiros, setBanheiros] = useState<number | null>(
    imovel?.banheiros ?? null,
  );
  const [areaPrivativa, setAreaPrivativa] = useState<number | null>(
    imovel?.areaPrivativa ?? null,
  );
  const [areaTerreno, setAreaTerreno] = useState<number | null>(
    imovel?.areaTerreno ?? null,
  );
  const [vagas, setVagas] = useState<number>(imovel?.vagas ?? 0);
  const [diferenciais, setDiferenciais] = useState<string[]>(
    imovel?.diferenciais ?? [],
  );

  const [descricao, setDescricao] = useState(imovel?.descricao ?? "");

  const [fotos, setFotos] = useState<Foto[]>(
    imovel?.fotos.map((f, i) => ({ url: f.url, ordem: i, capa: i === 0 })) ?? [],
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(
    imovel?.videoUrl ?? null,
  );

  const [publicado, setPublicado] = useState(imovel?.publicado ?? false);
  const [destaque, setDestaque] = useState(imovel?.destaque ?? false);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /** Monta o payload (ImovelInput) com fotos numeradas pela posição. */
  function montarPayload(publicar: boolean) {
    return {
      titulo: titulo.trim(),
      tipo,
      finalidade,
      preco: preco ?? 0,
      condominio,
      cidade: cidade.trim(),
      bairro: bairro.trim(),
      endereco: endereco.trim(),
      lat,
      lng,
      suites,
      banheiros,
      areaPrivativa,
      areaTerreno,
      vagas,
      descricao: descricao.trim(),
      diferenciais,
      destaque,
      publicado: publicar,
      fotos: fotos.map((f, i) => ({
        url: f.url,
        ordem: i,
        capa: i === 0,
      })),
      videoUrl,
    };
  }

  async function salvar(publicar: boolean) {
    setErro(null);

    // Validação mínima no cliente.
    if (titulo.trim().length < 2) {
      setErro("Informe o título do imóvel.");
      return;
    }
    if (cidade.trim().length < 2) {
      setErro("Informe a cidade.");
      return;
    }
    if (!preco || preco <= 0) {
      setErro("Informe um preço válido.");
      return;
    }
    // Permite salvar sem fotos, mas avisa.
    if (fotos.length === 0) {
      const seguir = window.confirm(
        "Este imóvel não tem fotos. As fotos são essenciais na vitrine. Deseja salvar mesmo assim?",
      );
      if (!seguir) return;
    }

    setPublicado(publicar);
    setSalvando(true);
    try {
      const url = editando ? `/api/imoveis/${imovel!.id}` : "/api/imoveis";
      const metodo = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(montarPayload(publicar)),
      });

      const data = (await res.json().catch(() => ({}))) as { erro?: string };

      if (!res.ok) {
        setErro(data.erro || "Não foi possível salvar o imóvel.");
        return;
      }

      router.push("/painel/imoveis");
      router.refresh();
    } catch {
      setErro("Falha de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  const capaUrl = fotos[0]?.url ?? null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        salvar(publicado);
      }}
      className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]"
    >
      {/* COLUNA ESQUERDA — formulário */}
      <div className="flex flex-col gap-14">
        {/* 1) Fotos */}
        <section className="flex flex-col gap-7">
          <SecaoTitulo numero="01" eyebrow="Imagens" titulo="Fotos do imóvel" />
          <ImageUploader value={fotos} onChange={setFotos} />
        </section>

        {/* 2) Informações principais */}
        <section className="flex flex-col gap-7">
          <SecaoTitulo
            numero="02"
            eyebrow="Identidade"
            titulo="Informações principais"
          />
          <div className="grid grid-cols-1 gap-6">
            <Field label="Título" htmlFor="titulo" required>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex.: Residência à beira-mar com vista panorâmica"
              />
            </Field>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Tipo" htmlFor="tipo">
                <Select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  {TIPOS_IMOVEL.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Finalidade" htmlFor="finalidade">
                <Select
                  id="finalidade"
                  value={finalidade}
                  onChange={(e) => setFinalidade(e.target.value)}
                >
                  {FINALIDADES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Preço (R$)" htmlFor="preco" required>
                <Input
                  id="preco"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={preco ?? ""}
                  onChange={(e) => setPreco(paraNumero(e.target.value))}
                  placeholder="2450000"
                />
              </Field>

              <Field
                label="Condomínio (R$/mês)"
                htmlFor="condominio"
                hint="Opcional"
              >
                <Input
                  id="condominio"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={condominio ?? ""}
                  onChange={(e) => setCondominio(paraNumero(e.target.value))}
                  placeholder="1800"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* 3) Localização */}
        <section className="flex flex-col gap-7">
          <SecaoTitulo
            numero="03"
            eyebrow="Endereço"
            titulo="Localização"
          />
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Cidade" htmlFor="cidade" required>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Capão da Canoa"
                />
              </Field>
              <Field label="Bairro" htmlFor="bairro">
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Centro"
                />
              </Field>
            </div>

            <Field label="Endereço" htmlFor="endereco">
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Av. Beira Mar, 1200"
              />
            </Field>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field
                label="Latitude"
                htmlFor="lat"
                hint="Para o mapa (opcional)"
              >
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={lat ?? ""}
                  onChange={(e) => setLat(paraNumero(e.target.value))}
                  placeholder="-29.7456"
                />
              </Field>
              <Field
                label="Longitude"
                htmlFor="lng"
                hint="Para o mapa (opcional)"
              >
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={lng ?? ""}
                  onChange={(e) => setLng(paraNumero(e.target.value))}
                  placeholder="-50.0123"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* 4) Características */}
        <section className="flex flex-col gap-7">
          <SecaoTitulo
            numero="04"
            eyebrow="Detalhes"
            titulo="Características"
          />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <Field label="Suítes" htmlFor="suites">
              <Input
                id="suites"
                type="number"
                min={0}
                inputMode="numeric"
                value={suites}
                onChange={(e) => setSuites(paraNumero(e.target.value) ?? 0)}
              />
            </Field>
            <Field label="Banheiros" htmlFor="banheiros">
              <Input
                id="banheiros"
                type="number"
                min={0}
                inputMode="numeric"
                value={banheiros ?? ""}
                onChange={(e) => setBanheiros(paraNumero(e.target.value))}
              />
            </Field>
            <Field label="Vagas" htmlFor="vagas">
              <Input
                id="vagas"
                type="number"
                min={0}
                inputMode="numeric"
                value={vagas}
                onChange={(e) => setVagas(paraNumero(e.target.value) ?? 0)}
              />
            </Field>
            <Field label="Área privativa (m²)" htmlFor="areaPrivativa">
              <Input
                id="areaPrivativa"
                type="number"
                min={0}
                inputMode="numeric"
                value={areaPrivativa ?? ""}
                onChange={(e) => setAreaPrivativa(paraNumero(e.target.value))}
              />
            </Field>
            <Field label="Área do terreno (m²)" htmlFor="areaTerreno">
              <Input
                id="areaTerreno"
                type="number"
                min={0}
                inputMode="numeric"
                value={areaTerreno ?? ""}
                onChange={(e) => setAreaTerreno(paraNumero(e.target.value))}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3">
            <span className="label text-[0.66rem] font-medium tracking-label text-stone-d">
              Diferenciais
            </span>
            <DiferenciaisPicker
              value={diferenciais}
              onChange={setDiferenciais}
            />
          </div>
        </section>

        {/* 5) Descrição */}
        <section className="flex flex-col gap-7">
          <SecaoTitulo numero="05" eyebrow="Narrativa" titulo="Descrição" />
          <Field
            label="Texto descritivo"
            htmlFor="descricao"
            hint="Conte a história do imóvel: ambientes, acabamentos, vistas e o estilo de vida que ele proporciona."
          >
            <Textarea
              id="descricao"
              rows={8}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Uma residência concebida para quem busca exclusividade…"
            />
          </Field>
        </section>

        {/* 6) Vídeo */}
        <section className="flex flex-col gap-7">
          <SecaoTitulo numero="06" eyebrow="Tour" titulo="Vídeo do imóvel" />
          <p className="-mt-2 text-sm leading-relaxed text-stone-d">
            Um tour em vídeo valoriza o anúncio e aparece em destaque na página
            do imóvel. Opcional.
          </p>
          <VideoUploader value={videoUrl} onChange={setVideoUrl} />
        </section>

        {/* 7) Rodapé de ações */}
        <section className="flex flex-col gap-6 border-t border-line pt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Toggle
              ativo={publicado}
              onChange={setPublicado}
              titulo="Publicar no site"
              descricao="Visível na vitrine pública."
            />
            <Toggle
              ativo={destaque}
              onChange={setDestaque}
              titulo="Destaque na home"
              descricao="Aparece na seleção principal."
            />
          </div>

          {erro && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => salvar(false)}
              disabled={salvando}
            >
              Salvar rascunho
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => salvar(true)}
              disabled={salvando}
            >
              <IconCheck className="h-4 w-4" />
              {salvando ? "Salvando…" : "Publicar imóvel"}
            </Button>
          </div>
        </section>
      </div>

      {/* COLUNA DIREITA — pré-visualização */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <LivePreview
          titulo={titulo}
          tipo={tipo}
          finalidade={finalidade}
          preco={preco ?? 0}
          cidade={cidade}
          bairro={bairro}
          suites={suites}
          banheiros={banheiros}
          areaPrivativa={areaPrivativa}
          vagas={vagas}
          destaque={destaque}
          capaUrl={capaUrl}
        />
      </div>
    </form>
  );
}
