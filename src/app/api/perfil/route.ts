import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { criarSessao, lerSessao } from "@/lib/auth";
import { removerUpload } from "@/lib/upload";

/**
 * PUT /api/perfil — atualiza os dados cadastrais do admin (corretor) logado.
 * Body JSON: { nome, email, creci?, telefone?, bio?, avatarUrl? }
 * Reemite a sessão (cookie) quando nome/e-mail mudam, mantendo o painel em dia.
 */
export async function PUT(req: Request) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const d = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const nome = str(d.nome);
  const email = str(d.email).toLowerCase();
  const creci = str(d.creci) || null;
  const telefone = str(d.telefone) || null;
  const bio = str(d.bio) || null;
  const avatarUrl = str(d.avatarUrl) || null;

  // Validações
  if (nome.length < 2) {
    return NextResponse.json({ erro: "Informe seu nome." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ erro: "E-mail inválido." }, { status: 422 });
  }

  // Resolve o admin. Como é um app de UM admin, se a sessão apontar para um id
  // que não existe mais (ex.: após um reseed do banco), caímos para o único
  // admin existente e reemitimos a sessão — auto-cura, sem 500.
  const alvo =
    (await prisma.admin.findUnique({ where: { id: sessao.id } })) ??
    (await prisma.admin.findFirst());
  if (!alvo) {
    return NextResponse.json(
      { erro: "Sessão inválida. Entre novamente." },
      { status: 401 },
    );
  }

  // E-mail único (não pode colidir com OUTRO registro)
  const emailEmUso = await prisma.admin.findFirst({
    where: { email, NOT: { id: alvo.id } },
    select: { id: true },
  });
  if (emailEmUso) {
    return NextResponse.json(
      { erro: "Este e-mail já está em uso." },
      { status: 409 },
    );
  }

  let admin;
  try {
    admin = await prisma.admin.update({
      where: { id: alvo.id },
      data: { nome, email, creci, telefone, bio, avatarUrl },
      select: {
        nome: true,
        email: true,
        creci: true,
        telefone: true,
        bio: true,
        avatarUrl: true,
      },
    });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível salvar o perfil." },
      { status: 500 },
    );
  }

  // Remove o avatar antigo se era um upload local e foi substituído.
  if (
    alvo.avatarUrl &&
    alvo.avatarUrl !== avatarUrl &&
    alvo.avatarUrl.startsWith("/uploads/")
  ) {
    await removerUpload(alvo.avatarUrl);
  }

  // Reemite a sessão com o id resolvido (corrige sessões antigas) + nome/e-mail.
  await criarSessao({ id: alvo.id, email: admin.email, nome: admin.nome });

  return NextResponse.json({ ok: true, admin }, { status: 200 });
}
