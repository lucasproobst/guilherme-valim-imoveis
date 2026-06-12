"use client";

/**
 * Uploader de fotos do imóvel.
 *  - Arraste imagens para a área ou clique em "Adicionar fotos".
 *  - As miniaturas são reordenáveis via drag & drop (HTML5).
 *  - A primeira foto é a capa (recebe o selo "Capa").
 *  - ordem/capa são derivados da posição na lista ao salvar.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { IconUpload, IconX } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Foto = { url: string; ordem: number; capa: boolean };

/**
 * Reduz/otimiza a imagem no navegador antes de enviar: redimensiona para no
 * máximo 2560px no maior lado e reexporta em JPEG. Isso mantém cada arquivo bem
 * abaixo do limite de corpo das funções serverless (Vercel) e deixa o site mais
 * leve. Em qualquer erro, devolve o arquivo original (à prova de falhas).
 */
async function comprimirImagem(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const MAX = 2560;
    const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    // Já é pequena e leve? Não mexe.
    if (escala === 1 && file.size <= 1_500_000) {
      bitmap.close();
      return file;
    }
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob || blob.size >= file.size) return file; // não melhorou → original
    const nome = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: Foto[];
  onChange: (proximo: Foto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState<{
    feitas: number;
    total: number;
  } | null>(null);
  const [soltando, setSoltando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // índice da miniatura sendo arrastada para reordenar
  const arrastandoIdx = useRef<number | null>(null);
  const [sobreIdx, setSobreIdx] = useState<number | null>(null);

  /** Normaliza ordem/capa a partir da posição. */
  function normalizar(urls: string[]): Foto[] {
    return urls.map((url, i) => ({ url, ordem: i, capa: i === 0 }));
  }

  /** Envia UM arquivo (já otimizado) e devolve a URL pública, ou null. */
  async function enviarUm(file: File): Promise<string | null> {
    try {
      const otimizada = await comprimirImagem(file);
      const form = new FormData();
      form.append("file", otimizada);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { urls?: string[] };
      return res.ok && data.urls?.[0] ? data.urls[0] : null;
    } catch {
      return null;
    }
  }

  async function enviarArquivos(files: FileList | File[]) {
    const lista = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (lista.length === 0) return;

    setErro(null);
    setEnviando(true);
    setProgresso({ feitas: 0, total: lista.length });

    // Uma requisição POR imagem (em pequenos lotes paralelos): assim qualquer
    // quantidade de fotos sobe de uma vez, sem estourar o limite de tamanho do
    // corpo das funções serverless da Vercel.
    const base = value.map((f) => f.url);
    const resultados: (string | null)[] = new Array(lista.length).fill(null);
    let feitas = 0;
    let falhas = 0;
    const LOTE = 4;

    try {
      for (let inicio = 0; inicio < lista.length; inicio += LOTE) {
        const bloco = lista.slice(inicio, inicio + LOTE);
        await Promise.all(
          bloco.map(async (file, j) => {
            const url = await enviarUm(file);
            if (url) resultados[inicio + j] = url;
            else falhas += 1;
            feitas += 1;
            setProgresso({ feitas, total: lista.length });
          }),
        );
        // Mostra as miniaturas já enviadas (progressivo), preservando a ordem.
        const enviadas = resultados.filter((u): u is string => Boolean(u));
        if (enviadas.length) onChange(normalizar([...base, ...enviadas]));
      }

      if (falhas > 0) {
        setErro(
          falhas === lista.length
            ? "Não foi possível enviar as imagens. Tente novamente."
            : `${falhas} de ${lista.length} imagens não foram enviadas — tente reenviá-las.`,
        );
      }
    } finally {
      setEnviando(false);
      setProgresso(null);
    }
  }

  function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      enviarArquivos(e.target.files);
    }
    // permite reenviar o mesmo arquivo depois
    e.target.value = "";
  }

  function aoSoltarArquivos(e: React.DragEvent) {
    e.preventDefault();
    setSoltando(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      enviarArquivos(e.dataTransfer.files);
    }
  }

  function remover(idx: number) {
    const restantes = value.filter((_, i) => i !== idx).map((f) => f.url);
    onChange(normalizar(restantes));
  }

  /* ---- reordenação das miniaturas ---- */
  function aoIniciarArraste(idx: number) {
    arrastandoIdx.current = idx;
  }

  function aoSobre(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setSobreIdx(idx);
  }

  function aoSoltarNaMiniatura(e: React.DragEvent, destino: number) {
    e.preventDefault();
    const origem = arrastandoIdx.current;
    arrastandoIdx.current = null;
    setSobreIdx(null);
    if (origem === null || origem === destino) return;

    const urls = value.map((f) => f.url);
    const [movido] = urls.splice(origem, 1);
    urls.splice(destino, 0, movido);
    onChange(normalizar(urls));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Área de drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSoltando(true);
        }}
        onDragLeave={() => setSoltando(false)}
        onDrop={aoSoltarArquivos}
        className={cn(
          "flex flex-col items-center justify-center rounded-sm border border-dashed px-6 py-12 text-center transition-colors duration-200",
          soltando
            ? "border-brass bg-brass/5"
            : "border-line bg-white hover:border-ink/30",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-brass">
          <IconUpload className="h-5 w-5" />
        </span>
        <p className="mt-4 font-display text-lg text-ink">
          Arraste as fotos para cá
        </p>
        <p className="mt-1 text-sm text-stone-d">
          Selecione várias de uma vez · JPG, PNG, WEBP ou AVIF · otimizamos
          automaticamente
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={aoSelecionar}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="label mt-6 inline-flex items-center gap-2 rounded-sm border border-ink/25 px-5 py-3 text-[0.72rem] font-medium tracking-label text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconUpload className="h-4 w-4" />
          {enviando
            ? progresso
              ? `Enviando ${progresso.feitas}/${progresso.total}…`
              : "Enviando…"
            : "Adicionar fotos"}
        </button>

        {erro && <p className="mt-4 text-xs text-red-600">{erro}</p>}
      </div>

      {/* Miniaturas reordenáveis */}
      {value.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="label text-[0.62rem] tracking-label text-stone-d">
              {value.length}{" "}
              {value.length === 1 ? "imagem" : "imagens"} · arraste para
              reordenar
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {value.map((foto, idx) => (
              <div
                key={foto.url}
                draggable
                onDragStart={() => aoIniciarArraste(idx)}
                onDragOver={(e) => aoSobre(e, idx)}
                onDrop={(e) => aoSoltarNaMiniatura(e, idx)}
                onDragEnd={() => {
                  arrastandoIdx.current = null;
                  setSobreIdx(null);
                }}
                className={cn(
                  "group relative aspect-[4/3] cursor-grab overflow-hidden rounded-sm border bg-ink-2 active:cursor-grabbing",
                  sobreIdx === idx ? "border-brass" : "border-line",
                )}
              >
                <Image
                  src={foto.url}
                  alt={`Foto ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />

                {idx === 0 && (
                  <span className="absolute left-2 top-2 z-10">
                    <Badge tom="brass">Capa</Badge>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remover(idx)}
                  aria-label={`Remover foto ${idx + 1}`}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-bone opacity-0 transition-opacity hover:bg-ink group-hover:opacity-100"
                >
                  <IconX className="h-4 w-4" />
                </button>

                {/* scrim para legibilidade dos controles */}
                <span
                  className="photo-scrim-top pointer-events-none absolute inset-x-0 top-0 h-1/3"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
