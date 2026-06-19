import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { storageHabilitado, assinarUploadStorage } from "@/lib/storage";
import { validarVideo } from "@/lib/upload";

/**
 * POST /api/upload/video/sign — devolve uma URL assinada para o navegador
 * enviar o vídeo DIRETO ao Supabase Storage (sem passar pela função, que tem
 * limite de ~4.5 MB de corpo na Vercel). Corpo: { contentType, size }.
 *
 * - mode "direct": { uploadUrl, publicUrl } — PUT do arquivo na uploadUrl.
 * - mode "proxy": sem Storage (dev local) — cliente usa /api/upload/video.
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  // Sem Storage configurado (dev local): cai para o upload multipart clássico.
  if (!storageHabilitado()) {
    return NextResponse.json({ mode: "proxy" }, { status: 200 });
  }

  let body: { contentType?: unknown; size?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : 0;

  try {
    validarVideo(contentType, size);
    const { uploadUrl, publicUrl } = await assinarUploadStorage(
      contentType,
      "videos",
    );
    return NextResponse.json(
      { mode: "direct", uploadUrl, publicUrl },
      { status: 200 },
    );
  } catch (e) {
    const mensagem =
      e instanceof Error ? e.message : "Falha ao preparar o envio do vídeo.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }
}
