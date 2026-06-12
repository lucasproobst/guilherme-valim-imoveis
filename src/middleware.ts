import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verificarSessao } from "@/lib/session";

/**
 * Protege todas as rotas do painel (/painel/**).
 * Sem sessão válida -> redireciona para /login (guardando o destino em ?next).
 * Já logado e tentando acessar /login -> manda para o painel.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const sessao = await verificarSessao(token);

  if (pathname.startsWith("/painel")) {
    if (!sessao) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && sessao) {
    const url = req.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*", "/login"],
};
