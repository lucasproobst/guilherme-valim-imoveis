import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugUnico } from "@/lib/slug";
import { parseImovelInput, type ImovelInput } from "@/lib/imovel-input";

/**
 * POST /api/imoveis — cria um novo imóvel.
 * Protegido (admin). Recebe ImovelInput (JSON) e devolve { id, slug }.
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

  let dados: ImovelInput;
  try {
    dados = parseImovelInput(body);
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : "Dados inválidos.";
    return NextResponse.json({ erro: mensagem }, { status: 422 });
  }

  // slug único derivado do título
  const slug = await slugUnico(dados.titulo, async (s) =>
    Boolean(await prisma.imovel.findUnique({ where: { slug: s } })),
  );

  const criado = await prisma.imovel.create({
    data: {
      slug,
      titulo: dados.titulo,
      tipo: dados.tipo,
      finalidade: dados.finalidade,
      preco: dados.preco,
      condominio: dados.condominio,
      cidade: dados.cidade,
      bairro: dados.bairro || null,
      endereco: dados.endereco || null,
      lat: dados.lat,
      lng: dados.lng,
      suites: dados.suites,
      banheiros: dados.banheiros,
      areaPrivativa: dados.areaPrivativa,
      areaTerreno: dados.areaTerreno,
      vagas: dados.vagas,
      descricao: dados.descricao,
      diferenciais: JSON.stringify(dados.diferenciais),
      videoUrl: dados.videoUrl,
      destaque: dados.destaque,
      publicado: dados.publicado,
      fotos: {
        create: dados.fotos.map((f, i) => ({
          url: f.url,
          ordem: i,
          capa: i === 0,
        })),
      },
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json(criado, { status: 201 });
}
