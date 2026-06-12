import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Camada de Supabase Storage (server-side).
 * Usada pela camada de upload quando há SUPABASE_SERVICE_ROLE_KEY no ambiente.
 * A service_role key é secreta — NUNCA use com prefixo NEXT_PUBLIC.
 */

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "uploads";

/** Há configuração para usar o Storage? (senão, cai para disco local) */
export function storageHabilitado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let _client: SupabaseClient | null = null;
function client(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase Storage não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** Sobe um buffer para o bucket (na pasta indicada) e devolve a URL pública. */
export async function subirParaStorage(
  buffer: Buffer,
  contentType: string,
  pasta: string,
): Promise<string> {
  const ext = EXT[contentType] || "bin";
  const path = `${pasta}/${crypto.randomUUID()}.${ext}`;
  const sb = client();
  const { error } = await sb.storage
    .from(SUPABASE_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Falha ao enviar para o Storage: ${error.message}`);
  return sb.storage.from(SUPABASE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Remove um arquivo do Storage a partir da sua URL pública (ignora outras). */
export async function removerDoStorage(url: string): Promise<void> {
  const marcador = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const i = url.indexOf(marcador);
  if (i === -1) return; // não é do nosso bucket (ex.: /brand/...)
  const path = url.slice(i + marcador.length);
  if (path) await client().storage.from(SUPABASE_BUCKET).remove([path]);
}
