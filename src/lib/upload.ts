import "server-only";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import {
  storageHabilitado,
  subirParaStorage,
  removerDoStorage,
} from "@/lib/storage";

export { assinarUploadStorage } from "@/lib/storage";

/**
 * Camada de upload ISOLADA. Duas estratégias, escolhidas pelo ambiente:
 *  - **Supabase Storage** quando há SUPABASE_SERVICE_ROLE_KEY (obrigatório em
 *    produção/Vercel, onde o disco é efêmero/somente-leitura).
 *  - **Disco local** (/public/uploads) como fallback de desenvolvimento.
 *
 * O resto do app só conhece estas três funções — trocar de provedor é aqui.
 */

const PASTA_UPLOADS = path.join(process.cwd(), "public", "uploads");
const URL_BASE = "/uploads";

const EXTENSOES_OK = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const TAMANHO_MAX = 8 * 1024 * 1024; // 8 MB por imagem

export const VIDEOS_OK = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);
export const TAMANHO_MAX_VIDEO = 150 * 1024 * 1024; // 150 MB por vídeo

/** Valida tipo e tamanho do vídeo. Lança Error com mensagem amigável. */
export function validarVideo(contentType: string, size: number): void {
  if (!VIDEOS_OK.has(contentType)) {
    throw new Error("Formato de vídeo inválido. Use MP4, WEBM ou MOV.");
  }
  if (size > TAMANHO_MAX_VIDEO) {
    throw new Error("Vídeo muito grande (máx. 150 MB).");
  }
}

function extensaoDoTipo(tipo: string): string {
  switch (tipo) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return "bin";
  }
}

/** Grava no disco local e devolve a URL pública (fallback de dev). */
async function salvarLocal(buffer: Buffer, tipo: string): Promise<string> {
  await fs.mkdir(PASTA_UPLOADS, { recursive: true });
  const nome = `${crypto.randomUUID()}.${extensaoDoTipo(tipo)}`;
  await fs.writeFile(path.join(PASTA_UPLOADS, nome), buffer);
  return `${URL_BASE}/${nome}`;
}

/** Salva uma imagem (multipart) e devolve a URL pública. */
export async function salvarUpload(file: File): Promise<string> {
  if (!EXTENSOES_OK.has(file.type)) {
    throw new Error("Formato inválido. Use JPG, PNG, WEBP ou AVIF.");
  }
  if (file.size > TAMANHO_MAX) {
    throw new Error("Imagem muito grande (máx. 8 MB).");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return storageHabilitado()
    ? subirParaStorage(buffer, file.type, "fotos")
    : salvarLocal(buffer, file.type);
}

/** Salva um vídeo (multipart) e devolve a URL pública. */
export async function salvarVideo(file: File): Promise<string> {
  validarVideo(file.type, file.size);
  const buffer = Buffer.from(await file.arrayBuffer());
  return storageHabilitado()
    ? subirParaStorage(buffer, file.type, "videos")
    : salvarLocal(buffer, file.type);
}

/** Remove um arquivo previamente salvo (Storage ou disco local). */
export async function removerUpload(url: string): Promise<void> {
  if (url.startsWith("http")) {
    // URL do Supabase Storage (ou externa) — delega ao Storage.
    await removerDoStorage(url);
    return;
  }
  if (!url.startsWith(URL_BASE)) return; // ex.: /brand/... (estático)
  try {
    await fs.unlink(path.join(PASTA_UPLOADS, path.basename(url)));
  } catch {
    // arquivo inexistente — nada a fazer
  }
}
