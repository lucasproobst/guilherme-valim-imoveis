import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugUnico } from "@/lib/slug";
import { removerUpload } from "@/lib/upload";
import { parseImovelInput, type ImovelInput } from "@/lib/imovel-input";

/**
 * Rotas de um imóvel específico (todas protegidas — admin):
 *  - PUT    /api/imoveis/[id]  -> atualiza todos os campos
 *  - PATCH  /api/imoveis/[id]  -> alterna publicação { publicado: boolean }
 *  - DELETE /api/imoveis/[id]  -> remove o imóvel (e suas fotos por cascade)
 */

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const id = params.id;

  const atual = await prisma.imovel.findUnique({
    where: { id },
    include: { fotos: true },
  });
  if (!atual) {
    return NextResponse.json(
      { erro: "Imóvel não encontrado." },
      { status: 404 },
    );
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

  // Regenera o slug só quando o título mudou; ignora o próprio registro.
  let slug = atual.slug;
  if (dados.titulo !== atual.titulo) {
    slug = await slugUnico(dados.titulo, async (s) => {
      const achado = await prisma.imovel.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      // disponível se não existe ou se é o próprio imóvel
      return achado ? achado.id !== id : false;
    });
  }

  // Fotos que estavam antes e foram removidas no payload: apagar do disco.
  const urlsNovas = new Set(dados.fotos.map((f) => f.url));
  const removidasLocais = atual.fotos
    .filter((f) => f.url.startsWith("/uploads/") && !urlsNovas.has(f.url))
    .map((f) => f.url);

  // Vídeo trocado/removido: apaga o arquivo local antigo.
  if (
    atual.videoUrl &&
    atual.videoUrl !== dados.videoUrl &&
    atual.videoUrl.startsWith("/uploads/")
  ) {
    removidasLocais.push(atual.videoUrl);
  }

  // Substitui o conjunto de fotos: apaga as antigas e recria pela ordem do payload.
  await prisma.$transaction([
    prisma.foto.deleteMany({ where: { imovelId: id } }),
    prisma.imovel.update({
      where: { id },
      data: {
        slug,
        titulo: dados.titulo,
        tipo: dados.tipo,
        finalidade: dados.finalidade,
        preco: dados.preco,
        condominio: dados.condominio,
        condominioNome: dados.condominioNome || null,
        cidade: dados.cidade,
        bairro: dados.bairro || null,
        endereco: dados.endereco || null,
        complementoPrivado: dados.complementoPrivado || null,
        lat: dados.lat,
        lng: dados.lng,
        suites: dados.suites,
        quartos: dados.quartos,
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
    }),
  ]);

  // Limpeza dos arquivos órfãos após persistir (ignora externas).
  await Promise.all(removidasLocais.map((url) => removerUpload(url)));

  return NextResponse.json({ id, slug }, { status: 200 });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
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

  const publicado = (body as Record<string, unknown>)?.publicado;
  if (typeof publicado !== "boolean") {
    return NextResponse.json(
      { erro: "Campo 'publicado' inválido." },
      { status: 422 },
    );
  }

  try {
    await prisma.imovel.update({
      where: { id: params.id },
      data: { publicado },
    });
  } catch {
    return NextResponse.json(
      { erro: "Imóvel não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const id = params.id;

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: { fotos: true },
  });
  if (!imovel) {
    return NextResponse.json(
      { erro: "Imóvel não encontrado." },
      { status: 404 },
    );
  }

  // Apaga os arquivos locais (URLs externas são ignoradas por removerUpload).
  await Promise.all([
    ...imovel.fotos.map((f) => removerUpload(f.url)),
    imovel.videoUrl ? removerUpload(imovel.videoUrl) : Promise.resolve(),
  ]);

  // As fotos caem por cascade (onDelete: Cascade no schema).
  await prisma.imovel.delete({ where: { id } });

  return NextResponse.json({ ok: true }, { status: 200 });
}
