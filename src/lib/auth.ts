import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  assinarSessao,
  verificarSessao,
} from "@/lib/session";
import type { AdminSession } from "@/lib/types";

/**
 * Autenticação do painel (lado servidor).
 * Existe apenas UM admin (o corretor). Usamos hash bcrypt para a senha e um
 * cookie httpOnly assinado (JWT) para a sessão.
 */

export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function verificarSenha(
  senha: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

/** Cria a sessão: assina o token e grava o cookie httpOnly. */
export async function criarSessao(dados: AdminSession): Promise<void> {
  const token = await assinarSessao(dados);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

/** Lê e valida a sessão atual (ou null). */
export async function lerSessao(): Promise<AdminSession | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verificarSessao(token);
}

/** Remove o cookie de sessão (logout). */
export function encerrarSessao(): void {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Garante que há um admin logado em páginas do painel.
 * Redireciona para /login quando não houver sessão.
 */
export async function exigirAdmin(): Promise<AdminSession> {
  const sessao = await lerSessao();
  if (!sessao) {
    redirect("/login");
  }
  return sessao;
}
