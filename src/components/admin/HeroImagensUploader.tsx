"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { IconUpload, IconX, IconGrip } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Upload de VÁRIAS imagens para o banner rotativo da home.
 * Controlado: value (string[] de URLs) / onChange. Arrastar para reordenar,
 * X para remover. A 1ª imagem é a que abre o site.
 */
export function HeroImagensUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  async function enviar(files: FileList | File[]) {
    const lista = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (lista.length === 0) return;
    setErro(null);
    setEnviando(true);
    try {
      const fd = new FormData();
      lista.forEach((f) => fd.append("file", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as {
        urls?: string[];
        erro?: string;
      };
      if (!res.ok || !j.urls?.length) {
        throw new Error(j.erro || "Falha ao enviar as imagens.");
      }
      onChange([...value, ...j.urls]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar as imagens.");
    } finally {
      setEnviando(false);
    }
  }

  function remover(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function reordenar(de: number, para: number) {
    if (de === para) return;
    const arr = [...value];
    const [item] = arr.splice(de, 1);
    arr.splice(para, 0, item);
    onChange(arr);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Miniaturas reordenáveis */}
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => (
            <li
              key={`${i}-${url}`}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) reordenar(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="group relative aspect-[4/3] cursor-grab overflow-hidden rounded-sm border border-line bg-bone-2 active:cursor-grabbing"
            >
              <Image
                src={url}
                alt={`Banner ${i + 1}`}
                fill
                sizes="(min-width: 640px) 200px, 45vw"
                className="object-cover"
              />
              {i === 0 && (
                <span className="label absolute left-2 top-2 bg-ink/70 px-2 py-0.5 text-[0.55rem] tracking-label text-brass-2">
                  Abre o site
                </span>
              )}
              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-sm bg-ink/60 text-bone opacity-0 transition-opacity group-hover:opacity-100">
                <IconGrip className="h-3.5 w-3.5" />
              </span>
              <button
                type="button"
                onClick={() => remover(i)}
                aria-label="Remover imagem"
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-sm bg-ink/70 text-bone transition-colors hover:bg-red-600"
              >
                <IconX className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Área de upload */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          if (e.dataTransfer.files?.length) enviar(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-6 py-8 text-center transition-colors",
          arrastando
            ? "border-brass bg-brass/5"
            : "border-line bg-bone/40 hover:border-brass/50",
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/10 text-brass">
          <IconUpload className="h-5 w-5" />
        </span>
        <span className="font-display text-sm text-ink">
          {enviando ? "Enviando…" : "Arraste imagens ou clique para enviar"}
        </span>
        <span className="text-xs text-stone">
          Várias imagens · elas passam em sequência no topo do site
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) enviar(e.target.files);
          e.target.value = "";
        }}
      />
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
