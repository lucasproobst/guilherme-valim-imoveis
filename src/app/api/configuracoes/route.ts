import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { lerSessao } from "@/lib/auth";
import { removerUpload } from "@/lib/upload";
import { CONFIG_SINGLETON_ID } from "@/lib/config-defaults";

/**
 * PUT /api/configuracoes — atualiza as configurações do site (identidade +
 * contato). Protegido (admin). Faz upsert da linha única; campos vazios voltam
 * a usar os defaults de CORRETOR.
 */
const CAMPOS = [
  "nome",
  "marca",
  "subtitulo",
  "assinatura",
  "creci",
  "regiao",
  "email",
  "telefone",
  "whatsapp",
  "instagram",
  "endereco",
  // conteúdo editável (texto)
  "heroEyebrow",
  "heroTitulo",
  "heroSubtitulo",
  "sobreTitulo",
  "sobreResumo",
  "bio",
  "ctaTitulo",
  "ctaTexto",
] as const;

/** Normaliza uma lista de {numero,rotulo} para JSON (ou null se vazia). */
function statsParaJson(v: unknown): string | null {
  if (!Array.isArray(v)) return null;
  const limpa = v
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return {
        numero: typeof o.numero === "string" ? o.numero.trim() : "",
        rotulo: typeof o.rotulo === "string" ? o.rotulo.trim() : "",
      };
    })
    .filter((x) => x.numero || x.rotulo);
  return limpa.length ? JSON.stringify(limpa) : null;
}

/** Normaliza uma lista de URLs (string[]) para JSON (ou null se vazia). */
function urlsParaJson(v: unknown): string | null {
  if (!Array.isArray(v)) return null;
  const limpa = v.filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  return limpa.length ? JSON.stringify(limpa) : null;
}

/** Normaliza uma lista de {titulo,texto} para JSON (ou null se vazia). */
function passosParaJson(v: unknown): string | null {
  if (!Array.isArray(v)) return null;
  const limpa = v
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return {
        titulo: typeof o.titulo === "string" ? o.titulo.trim() : "",
        texto: typeof o.texto === "string" ? o.texto.trim() : "",
      };
    })
    .filter((x) => x.titulo || x.texto);
  return limpa.length ? JSON.stringify(limpa) : null;
}

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
  const dados: Record<string, string | null> = {};
  for (const campo of CAMPOS) {
    const v = d[campo];
    dados[campo] = typeof v === "string" && v.trim() ? v.trim() : null;
  }

  // WhatsApp é usado em links (wa.me / tel:) — guardamos só os dígitos (com DDI).
  if (dados.whatsapp) {
    const digitos = dados.whatsapp.replace(/\D/g, "");
    dados.whatsapp = digitos.length >= 8 ? digitos : null;
  }

  // Listas (números/destaques/passos/banner) → JSON.
  dados.numeros = statsParaJson(d.numeros);
  dados.miniDestaques = statsParaJson(d.miniDestaques);
  dados.passos = passosParaJson(d.passos);
  dados.heroImagens = urlsParaJson(d.heroImagens);

  // Validações leves.
  if (dados.marca === null && dados.nome === null) {
    return NextResponse.json(
      { erro: "Informe o nome ou a marca." },
      { status: 422 },
    );
  }
  if (
    dados.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)
  ) {
    return NextResponse.json({ erro: "E-mail inválido." }, { status: 422 });
  }

  // Foto do corretor (retratoUrl) = avatar do admin (fonte única do retrato).
  const retratoUrl =
    typeof d.retratoUrl === "string" && d.retratoUrl.trim()
      ? d.retratoUrl.trim()
      : null;

  try {
    await prisma.config.upsert({
      where: { id: CONFIG_SINGLETON_ID },
      update: dados,
      create: { id: CONFIG_SINGLETON_ID, ...dados },
    });

    // Sincroniza o avatar do admin com a foto enviada nas configurações.
    const admin = await prisma.admin.findFirst({
      select: { id: true, avatarUrl: true },
    });
    if (admin && admin.avatarUrl !== retratoUrl) {
      if (
        admin.avatarUrl &&
        admin.avatarUrl.startsWith("/uploads/") &&
        admin.avatarUrl !== retratoUrl
      ) {
        await removerUpload(admin.avatarUrl);
      }
      await prisma.admin.update({
        where: { id: admin.id },
        data: { avatarUrl: retratoUrl },
      });
    }
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível salvar as configurações." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
