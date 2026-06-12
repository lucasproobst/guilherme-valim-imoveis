"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { VideoFrame } from "@/components/ui/VideoFrame";
import { IconUpload, IconTrash } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Upload de UM vídeo de tour do imóvel. Drag & drop ou seleção.
 * Mostra o vídeo já na moldura final (VideoFrame) com opção de remover.
 * Controlado: value (url|null) / onChange.
 */
export function VideoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);

  async function enviar(file: File) {
    setErro(null);
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/video", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as {
        url?: string;
        erro?: string;
      };
      if (!res.ok || !j.url) {
        throw new Error(j.erro || "Falha ao enviar o vídeo.");
      }
      onChange(j.url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar o vídeo.");
    } finally {
      setEnviando(false);
    }
  }

  if (value) {
    return (
      <div className="space-y-3">
        <VideoFrame src={value} />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
          >
            <IconUpload className="h-4 w-4" />
            {enviando ? "Enviando…" : "Trocar vídeo"}
          </Button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="label inline-flex items-center gap-1.5 text-[0.66rem] tracking-label text-stone-d transition-colors hover:text-red-600"
          >
            <IconTrash className="h-3.5 w-3.5" />
            Remover vídeo
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) enviar(f);
            e.target.value = "";
          }}
        />
        {erro && <p className="text-xs text-red-600">{erro}</p>}
      </div>
    );
  }

  return (
    <div>
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
          const f = e.dataTransfer.files?.[0];
          if (f) enviar(f);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-sm border border-dashed px-6 py-12 text-center transition-colors",
          arrastando
            ? "border-brass bg-brass/5"
            : "border-line bg-bone/40 hover:border-brass/50",
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brass/10 text-brass">
          <IconUpload className="h-5 w-5" />
        </span>
        <span className="font-display text-base text-ink">
          {enviando ? "Enviando vídeo…" : "Arraste o vídeo para cá"}
        </span>
        <span className="text-xs text-stone">
          MP4, WEBM ou MOV · até 80 MB · clique para selecionar
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) enviar(f);
          e.target.value = "";
        }}
      />
      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
