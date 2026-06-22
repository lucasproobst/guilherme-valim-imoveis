import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * PUT /api/condominios/[id] — atualiza nome/cidade. Protegido (admin).
 * DELETE /api/condominios/[id] — remove o condomínio.
 */

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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
    await prisma.condominio.update({
      where: { id: params.id },
      data: { nome, cidade },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe um condomínio com esse nome." },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { erro: "Não foi possível atualizar o condomínio." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    await prisma.condominio.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível excluir o condomínio." },
      { status: 500 },
    );
  }
}
