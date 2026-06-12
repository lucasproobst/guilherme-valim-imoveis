import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/leads — grava um contato (lead) recebido pelos formulários do site.
 * Body JSON: { nome, whatsapp, mensagem?, imovelId?, origem? }
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const dados = body as Record<string, unknown>;
  const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
  const whatsapp =
    typeof dados.whatsapp === "string" ? dados.whatsapp.trim() : "";
  const mensagem =
    typeof dados.mensagem === "string" && dados.mensagem.trim()
      ? dados.mensagem.trim()
      : null;
  const imovelId =
    typeof dados.imovelId === "string" && dados.imovelId ? dados.imovelId : null;
  const origem =
    typeof dados.origem === "string" && dados.origem ? dados.origem : "site";

  if (nome.length < 2) {
    return NextResponse.json({ erro: "Informe seu nome." }, { status: 422 });
  }
  // exige ao menos 8 dígitos no telefone
  if (whatsapp.replace(/\D/g, "").length < 8) {
    return NextResponse.json(
      { erro: "Informe um WhatsApp válido." },
      { status: 422 },
    );
  }

  // valida o imóvel de interesse (se enviado) para não gravar FK inválida
  let imovelIdValido: string | null = null;
  if (imovelId) {
    const existe = await prisma.imovel.findUnique({
      where: { id: imovelId },
      select: { id: true },
    });
    imovelIdValido = existe ? imovelId : null;
  }

  await prisma.lead.create({
    data: {
      nome,
      whatsapp,
      mensagem,
      imovelId: imovelIdValido,
      origem,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
