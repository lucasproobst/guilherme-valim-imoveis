import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { criarSessao, hashSenha, lerSessao } from "@/lib/auth";

/**
 * Operações sobre um usuário do painel.
 * PUT    — atualiza { nome?, email?, senha? } (trocar senha / dados).
 * DELETE — remove o usuário (protege contra excluir a si mesmo / o último).
 * Protegido: só um admin logado.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const alvo = await prisma.admin.findUnique({ where: { id: params.id } });
  if (!alvo) {
    return NextResponse.json(
      { erro: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }
  const d = body as Record<string, unknown>;

  const data: { nome?: string; email?: string; senhaHash?: string } = {};

  if (typeof d.nome === "string") {
    const nome = str(d.nome);
    if (nome.length < 2) {
      return NextResponse.json(
        { erro: "Informe o nome do usuário." },
        { status: 422 },
      );
    }
    data.nome = nome;
  }

  if (typeof d.email === "string") {
    const email = str(d.email).toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ erro: "E-mail inválido." }, { status: 422 });
    }
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
    data.email = email;
  }

  if (typeof d.senha === "string" && d.senha.length > 0) {
    if (d.senha.length < 6) {
      return NextResponse.json(
        { erro: "A senha deve ter ao menos 6 caracteres." },
        { status: 422 },
      );
    }
    data.senhaHash = await hashSenha(d.senha);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 422 });
  }

  const atualizado = await prisma.admin.update({
    where: { id: alvo.id },
    data,
    select: { id: true, nome: true, email: true },
  });

  // Se o admin alterou os PRÓPRIOS dados (nome/e-mail), reemite a sessão.
  if (alvo.id === sessao.id && (data.nome || data.email)) {
    await criarSessao({
      id: atualizado.id,
      email: atualizado.email,
      nome: atualizado.nome,
    });
  }

  return NextResponse.json({ ok: true, usuario: atualizado });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  if (params.id === sessao.id) {
    return NextResponse.json(
      { erro: "Você não pode excluir o seu próprio usuário." },
      { status: 422 },
    );
  }

  const total = await prisma.admin.count();
  if (total <= 1) {
    return NextResponse.json(
      { erro: "Não é possível excluir o último usuário." },
      { status: 422 },
    );
  }

  const alvo = await prisma.admin.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!alvo) {
    return NextResponse.json(
      { erro: "Usuário não encontrado." },
      { status: 404 },
    );
  }

  await prisma.admin.delete({ where: { id: alvo.id } });
  return NextResponse.json({ ok: true });
}
