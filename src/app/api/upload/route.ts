import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { salvarUpload } from "@/lib/upload";

/**
 * POST /api/upload — recebe imagens (multipart) e devolve as URLs públicas.
 * Protegido: apenas o admin autenticado pode enviar.
 * Campo(s) "file" no FormData; resposta { urls: string[] }.
 */
export async function POST(req: Request) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { erro: "Envio inválido." },
      { status: 400 },
    );
  }

  const arquivos = form.getAll("file") as File[];
  if (arquivos.length === 0) {
    return NextResponse.json(
      { erro: "Nenhuma imagem recebida." },
      { status: 400 },
    );
  }

  try {
    const urls: string[] = [];
    for (const arquivo of arquivos) {
      // Ignora entradas vazias que alguns navegadores anexam.
      if (!(arquivo instanceof File) || arquivo.size === 0) continue;
      const url = await salvarUpload(arquivo);
      urls.push(url);
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { erro: "Nenhuma imagem válida recebida." },
        { status: 400 },
      );
    }

    return NextResponse.json({ urls }, { status: 200 });
  } catch (e) {
    // salvarUpload lança Error com mensagem amigável em validação (formato/tamanho)
    const mensagem =
      e instanceof Error ? e.message : "Falha ao processar a imagem.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }
}
