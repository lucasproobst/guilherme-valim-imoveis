"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { VideoFrame } from "@/components/ui/VideoFrame";
import { IconUpload, IconTrash } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const TIPOS_OK = ["video/mp4", "video/webm", "video/quicktime"];
const TAMANHO_MAX = 50 * 1024 * 1024; // 50 MB — igual ao limite do servidor/bucket

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
  const [link, setLink] = useState("");

  /** Usa um link de vídeo (YouTube/Vimeo ou URL direta) em vez de upload. */
  function aplicarLink() {
    const l = link.trim();
    if (!l) return;
    if (!/^https?:\/\//i.test(l)) {
      setErro("Cole um link válido, começando com https://");
      return;
    }
    setErro(null);
    onChange(l);
    setLink("");
  }

  async function enviar(file: File) {
    setErro(null);

    // Validação amigável antes de subir (espelha o limite do servidor).
    if (!TIPOS_OK.includes(file.type)) {
      setErro("Formato de vídeo inválido. Use MP4, WEBM ou MOV.");
      return;
    }
    if (file.size > TAMANHO_MAX) {
      setErro("Vídeo muito grande (máx. 50 MB).");
      return;
    }

    setEnviando(true);
    try {
      // 1) Pede uma URL assinada — o arquivo grande NÃO passa pela função
      //    (Vercel limita o corpo a ~4.5 MB). Em produção: upload direto ao Storage.
      const signRes = await fetch("/api/upload/video/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const sign = (await signRes.json().catch(() => ({}))) as {
        mode?: "direct" | "proxy";
        uploadUrl?: string;
        publicUrl?: string;
        erro?: string;
      };
      if (!signRes.ok) {
        throw new Error(sign.erro || "Falha ao preparar o envio do vídeo.");
      }

      if (sign.mode === "direct" && sign.uploadUrl && sign.publicUrl) {
        // 2) Envia o arquivo DIRETO ao Supabase Storage (sem limite da função).
        const putRes = await fetch(sign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!putRes.ok) {
          throw new Error(
            "Falha ao enviar o vídeo para o armazenamento. Verifique o limite de tamanho do bucket no Supabase.",
          );
        }
        onChange(sign.publicUrl);
        return;
      }

      // Fallback (dev local, sem Storage): upload multipart tradicional.
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
          MP4, WEBM ou MOV · até 50 MB · clique para selecionar
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

      {/* Alternativa por link — sem limite de tamanho e sem problema de codec */}
      <div className="mt-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="label text-[0.6rem] tracking-label text-stone">
            ou use um link
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            inputMode="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                aplicarLink();
              }
            }}
            placeholder="Cole o link do YouTube ou Vimeo"
          />
          <Button
            type="button"
            variant="dark"
            size="md"
            onClick={aplicarLink}
            className="shrink-0"
          >
            Usar link
          </Button>
        </div>
        <p className="mt-2 text-xs text-stone">
          Recomendado para vídeos grandes (acima de 50 MB): sem limite de
          tamanho e sempre toca no navegador.
        </p>
      </div>

      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
