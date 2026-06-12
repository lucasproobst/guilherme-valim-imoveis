import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSenha, lerSessao } from "@/lib/auth";

/**
 * Gerenciamento de usuários do painel (acessos ao admin).
 * GET  — lista os usuários (sem senha).
 * POST — cria um novo usuário { nome, email, senha }.
 * Protegido: só um admin logado pode gerenciar acessos.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function GET() {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  const admins = await prisma.admin.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true },
  });
  return NextResponse.json({ usuarios: admins });
}

export async function POST(req: Request) {
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

  const nome = str(d.nome);
  const email = str(d.email).toLowerCase();
  const senha = typeof d.senha === "string" ? d.senha : "";

  if (nome.length < 2) {
    return NextResponse.json(
      { erro: "Informe o nome do usuário." },
      { status: 422 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ erro: "E-mail inválido." }, { status: 422 });
  }
  if (senha.length < 6) {
    return NextResponse.json(
      { erro: "A senha deve ter ao menos 6 caracteres." },
      { status: 422 },
    );
  }

  const existe = await prisma.admin.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existe) {
    return NextResponse.json(
      { erro: "Já existe um usuário com este e-mail." },
      { status: 409 },
    );
  }

  const senhaHash = await hashSenha(senha);
  const novo = await prisma.admin.create({
    data: { nome, email, senhaHash },
    select: { id: true, nome: true, email: true },
  });

  return NextResponse.json({ ok: true, usuario: novo }, { status: 201 });
}
