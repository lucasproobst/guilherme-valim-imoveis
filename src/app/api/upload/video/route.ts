import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { salvarVideo } from "@/lib/upload";

/**
 * POST /api/upload/video — recebe um vídeo (multipart) e devolve a URL pública.
 * Protegido: apenas o admin autenticado. Campo "file"; resposta { url }.
 */
export const runtime = "nodejs";
// Vídeos podem passar do limite padrão de body do route handler.
export const maxDuration = 60;

export async function POST(req: Request) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }

  const arquivo = form.get("file");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return NextResponse.json(
      { erro: "Nenhum vídeo recebido." },
      { status: 400 },
    );
  }

  try {
    const url = await salvarVideo(arquivo);
    return NextResponse.json({ url }, { status: 200 });
  } catch (e) {
    const mensagem =
      e instanceof Error ? e.message : "Falha ao processar o vídeo.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }
}
