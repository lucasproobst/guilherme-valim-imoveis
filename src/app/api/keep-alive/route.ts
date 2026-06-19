import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/keep-alive — consulta trivial ao banco para manter o projeto
 * Supabase ATIVO (o plano free pausa após ~7 dias sem atividade).
 * Chamado por um Vercel Cron 1x/dia (ver vercel.json).
 *
 * Segurança: se CRON_SECRET estiver definido, exige o header
 * "Authorization: Bearer <CRON_SECRET>" (a Vercel envia automaticamente nos
 * crons). Sem CRON_SECRET, fica aberto (consulta inofensiva de leitura).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
  }

  try {
    // Consulta mínima — só para registrar atividade no Postgres.
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
