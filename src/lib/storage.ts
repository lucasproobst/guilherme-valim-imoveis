import crypto from "crypto";

/**
 * Camada de Supabase Storage (server-side) via REST API (fetch).
 * Usamos a REST API direta (em vez do SDK) para funcionar igual no app (Next)
 * e em scripts Node (seed) — sem o cliente Realtime/WebSocket do supabase-js.
 *
 * A service_role key é SECRETA — só servidor, nunca com prefixo NEXT_PUBLIC.
 */

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "uploads";

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key };
}

/** Há configuração para usar o Storage? (senão, cai para disco local) */
export function storageHabilitado(): boolean {
  const { url, key } = env();
  return Boolean(url && key);
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
  const { url, key } = env();
  if (!url || !key) {
    throw new Error(
      "Supabase Storage não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  const ext = EXT[contentType] || "bin";
  const objeto = `${pasta}/${crypto.randomUUID()}.${ext}`;

  const res = await fetch(
    `${url}/storage/v1/object/${SUPABASE_BUCKET}/${objeto}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType,
        "cache-control": "31536000",
        "x-upsert": "false",
      },
      body: new Uint8Array(buffer),
    },
  );

  if (!res.ok) {
    const detalhe = await res.text().catch(() => "");
    throw new Error(
      `Falha ao enviar para o Storage (${res.status}): ${detalhe.slice(0, 140)}`,
    );
  }

  return `${url}/storage/v1/object/public/${SUPABASE_BUCKET}/${objeto}`;
}

/** Remove um arquivo do Storage a partir da sua URL pública (ignora outras). */
export async function removerDoStorage(urlPublica: string): Promise<void> {
  const { url, key } = env();
  if (!url || !key) return;
  const marcador = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const i = urlPublica.indexOf(marcador);
  if (i === -1) return; // não é do nosso bucket
  const objeto = urlPublica.slice(i + marcador.length);
  if (!objeto) return;
  await fetch(`${url}/storage/v1/object/${SUPABASE_BUCKET}/${objeto}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => {});
}
