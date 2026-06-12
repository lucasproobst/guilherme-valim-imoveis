import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { criarSessao, verificarSenha } from "@/lib/auth";

/**
 * POST /api/auth/login — autentica o corretor no painel.
 * Body JSON: { email, senha }
 * 200 { ok: true } + cookie de sessão | 401 { erro }
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const dados = body as Record<string, unknown>;
  const email = typeof dados.email === "string" ? dados.email.trim() : "";
  const senha = typeof dados.senha === "string" ? dados.senha : "";

  // Credenciais ausentes — devolve a mesma mensagem genérica por segurança.
  if (!email || !senha) {
    return NextResponse.json(
      { erro: "Credenciais inválidas." },
      { status: 401 },
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json(
      { erro: "Credenciais inválidas." },
      { status: 401 },
    );
  }

  const ok = await verificarSenha(senha, admin.senhaHash);
  if (!ok) {
    return NextResponse.json(
      { erro: "Credenciais inválidas." },
      { status: 401 },
    );
  }

  await criarSessao({ id: admin.id, email: admin.email, nome: admin.nome });

  return NextResponse.json({ ok: true }, { status: 200 });
}
