import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSenha, lerSessao, verificarSenha } from "@/lib/auth";

/**
 * POST /api/perfil/senha — troca a senha do admin logado.
 * Body JSON: { senhaAtual, novaSenha }
 * Exige a senha atual correta antes de gravar a nova (com hash bcrypt).
 */
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
  const senhaAtual = typeof d.senhaAtual === "string" ? d.senhaAtual : "";
  const novaSenha = typeof d.novaSenha === "string" ? d.novaSenha : "";

  if (novaSenha.length < 6) {
    return NextResponse.json(
      { erro: "A nova senha deve ter ao menos 6 caracteres." },
      { status: 422 },
    );
  }

  // App de um admin: se a sessão for de um id inexistente (ex.: após reseed),
  // cai para o único admin existente.
  const admin =
    (await prisma.admin.findUnique({ where: { id: sessao.id } })) ??
    (await prisma.admin.findFirst());
  if (!admin) {
    return NextResponse.json(
      { erro: "Sessão inválida. Entre novamente." },
      { status: 401 },
    );
  }

  const confere = await verificarSenha(senhaAtual, admin.senhaHash);
  if (!confere) {
    return NextResponse.json(
      { erro: "Senha atual incorreta." },
      { status: 422 },
    );
  }

  const senhaHash = await hashSenha(novaSenha);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { senhaHash },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
