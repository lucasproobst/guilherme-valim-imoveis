import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/auth";

/**
 * POST /api/auth/logout — encerra a sessão do painel (limpa o cookie).
 * 200 { ok: true }
 */
export async function POST() {
  encerrarSessao();
  return NextResponse.json({ ok: true }, { status: 200 });
}
