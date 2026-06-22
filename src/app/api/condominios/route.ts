import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/condominios — cria um condomínio. Protegido (admin).
 * Corpo: { nome, cidade? }. Devolve { id }.
 */
export async function POST(req: Request) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: { nome?: unknown; cidade?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const cidade =
    typeof body.cidade === "string" && body.cidade.trim()
      ? body.cidade.trim()
      : null;

  if (nome.length < 2) {
    return NextResponse.json(
      { erro: "Informe o nome do condomínio." },
      { status: 422 },
    );
  }

  try {
    const criado = await prisma.condominio.create({
      data: { nome, cidade },
      select: { id: true },
    });
    return NextResponse.json(criado, { status: 201 });
  } catch (e) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe um condomínio com esse nome." },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { erro: "Não foi possível criar o condomínio." },
      { status: 500 },
    );
  }
}
