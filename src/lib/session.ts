import { SignJWT, jwtVerify } from "jose";
import type { AdminSession } from "@/lib/types";

/**
 * Camada de sessão **edge-safe** (usa apenas `jose`, sem Node APIs).
 * Pode ser importada tanto pelo middleware (edge runtime) quanto pelo
 * servidor. Assina/verifica o JWT que identifica o admin logado.
 */

export const SESSION_COOKIE = "mv_sessao";
const ALG = "HS256";
const EXPIRACAO = "7d";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não definido no ambiente (.env).");
  }
  return new TextEncoder().encode(secret);
}

/** Gera o token assinado a partir dos dados do admin. */
export async function assinarSessao(dados: AdminSession): Promise<string> {
  return new SignJWT({ ...dados })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRACAO)
    .sign(getSecret());
}

/** Valida o token e devolve a sessão, ou null se inválido/expirado. */
export async function verificarSessao(
  token: string | undefined,
): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: [ALG],
    });
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.nome === "string"
    ) {
      return { id: payload.id, email: payload.email, nome: payload.nome };
    }
    return null;
  } catch {
    return null;
  }
}
