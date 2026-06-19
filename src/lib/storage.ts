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

/**
 * Cria uma URL ASSINADA para upload DIRETO do navegador ao Storage.
 * Necessário para arquivos grandes (vídeos): em serverless (Vercel) o corpo
 * de uma requisição é limitado a ~4.5 MB, então o arquivo não pode passar
 * pela API — o navegador envia direto ao Supabase com esta URL.
 * Devolve a URL de PUT (assinada) e a URL pública final do objeto.
 */
export async function assinarUploadStorage(
  contentType: string,
  pasta: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const { url, key } = env();
  if (!url || !key) {
    throw new Error(
      "Supabase Storage não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
  }
  const ext = EXT[contentType] || "bin";
  const objeto = `${pasta}/${crypto.randomUUID()}.${ext}`;

  const res = await fetch(
    `${url}/storage/v1/object/upload/sign/${SUPABASE_BUCKET}/${objeto}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );

  if (!res.ok) {
    const detalhe = await res.text().catch(() => "");
    throw new Error(
      `Falha ao assinar o upload (${res.status}): ${detalhe.slice(0, 140)}`,
    );
  }

  const dados = (await res.json().catch(() => ({}))) as { url?: string };
  if (!dados.url) {
    throw new Error("Storage não retornou a URL assinada.");
  }

  return {
    // dados.url já vem como "/object/upload/sign/<bucket>/<objeto>?token=..."
    uploadUrl: `${url}/storage/v1${dados.url}`,
    publicUrl: `${url}/storage/v1/object/public/${SUPABASE_BUCKET}/${objeto}`,
  };
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
