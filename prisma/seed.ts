/**
 * Seed — popula o banco para o site "já nascer cheio".
 * Cria o corretor (admin), 6 imóveis fictícios no litoral do RS com fotos
 * geradas em /public/uploads/seed, e alguns leads de exemplo.
 *
 * Rode com: `npm run seed` (idempotente — limpa e recria os dados).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { gerarSVG, PALETAS } from "./imagens";
import { slugify } from "../src/lib/slug";
import { storageHabilitado, subirParaStorage } from "../src/lib/storage";

const prisma = new PrismaClient();
const DIR_SEED = path.join(process.cwd(), "public", "uploads", "seed");

type Cena = "fachada" | "living" | "vista" | "suite";
const CENAS_PADRAO: { cena: Cena; rotulo: string }[] = [
  { cena: "fachada", rotulo: "Fachada" },
  { cena: "living", rotulo: "Living integrado" },
  { cena: "vista", rotulo: "Vista" },
  { cena: "suite", rotulo: "Suíte master" },
];

type SeedImovel = {
  titulo: string;
  tipo: string;
  finalidade: string;
  preco: number;
  condominio?: number;
  cidade: string;
  bairro: string;
  endereco: string;
  lat: number;
  lng: number;
  suites: number;
  banheiros: number;
  areaPrivativa: number;
  areaTerreno?: number;
  vagas: number;
  descricao: string;
  diferenciais: string[];
  destaque: boolean;
  paleta: keyof typeof PALETAS;
};

const IMOVEIS: SeedImovel[] = [
  {
    titulo: "Villa Marítima Aurora",
    tipo: "Casa",
    finalidade: "Venda",
    preco: 4850000,
    condominio: 1800,
    cidade: "Xangri-lá",
    bairro: "Atlântida",
    endereco: "Av. Beira Mar, 2200 — Atlântida, Xangri-lá/RS",
    lat: -29.8123,
    lng: -50.0451,
    suites: 5,
    banheiros: 7,
    areaPrivativa: 620,
    areaTerreno: 1100,
    vagas: 6,
    descricao:
      "Uma residência de frente para o mar concebida como refúgio contemporâneo. Pé-direito duplo no living, esquadrias de piso a teto que dissolvem a fronteira entre interior e a orla, e uma piscina de borda infinita voltada ao pôr do sol. Os ambientes sociais integram cozinha gourmet, adega climatizada e espaço gourmet com churrasqueira, enquanto as cinco suítes — todas com varanda — garantem privacidade. Acabamentos em pedra natural, automação completa e energia solar fazem da Villa Aurora um endereço definitivo.",
    diferenciais: [
      "Piscina",
      "Vista mar",
      "Frente para o mar",
      "Automação",
      "Energia solar",
      "Espaço gourmet",
      "Adega",
      "Cozinha gourmet",
    ],
    destaque: true,
    paleta: "litoral",
  },
  {
    titulo: "Cobertura Vista Mar",
    tipo: "Cobertura",
    finalidade: "Venda",
    preco: 3200000,
    condominio: 2400,
    cidade: "Capão da Canoa",
    bairro: "Centro",
    endereco: "Av. Paraguassú, 1500 — Centro, Capão da Canoa/RS",
    lat: -29.7456,
    lng: -50.0102,
    suites: 4,
    banheiros: 5,
    areaPrivativa: 340,
    vagas: 4,
    descricao:
      "Cobertura duplex no coração de Capão da Canoa, com terraço panorâmico de 120 m² voltado para o oceano. O living social abre-se para a varanda gourmet com piscina aquecida e ofurô, ponto perfeito para receber. Quatro suítes amplas, home theater, lareira a etanol e elevador privativo. Vista desobstruída do mar em todos os ambientes sociais e na suíte master.",
    diferenciais: [
      "Vista mar",
      "Piscina",
      "Elevador",
      "Home theater",
      "Lareira",
      "Espaço gourmet",
      "Hidromassagem",
    ],
    destaque: true,
    paleta: "noite",
  },
  {
    titulo: "Residência Jardim Botânico",
    tipo: "Casa",
    finalidade: "Venda",
    preco: 5900000,
    condominio: 2100,
    cidade: "Xangri-lá",
    bairro: "Condomínio Atlântida Sul",
    endereco: "Alameda das Acácias, 88 — Atlântida Sul, Xangri-lá/RS",
    lat: -29.8201,
    lng: -50.0388,
    suites: 5,
    banheiros: 6,
    areaPrivativa: 540,
    areaTerreno: 1500,
    vagas: 5,
    descricao:
      "Arquitetura assinada em meio a um jardim botânico particular com espelhos d'água e vegetação nativa. A casa se organiza em pavilhões conectados por passarelas sobre a água, criando uma experiência sensorial única. Living de 90 m², cozinha gourmet com ilha em mármore, academia equipada e espaço de bem-estar com sauna. Sustentabilidade no centro do projeto: energia solar, reúso de água e iluminação inteligente.",
    diferenciais: [
      "Jardim",
      "Piscina",
      "Energia solar",
      "Academia",
      "Automação",
      "Cozinha gourmet",
      "Sistema de segurança",
    ],
    destaque: true,
    paleta: "bosque",
  },
  {
    titulo: "Apartamento Horizonte Dunas",
    tipo: "Apartamento",
    finalidade: "Venda",
    preco: 1780000,
    condominio: 1200,
    cidade: "Torres",
    bairro: "Praia Grande",
    endereco: "Av. Beira Mar, 740 — Praia Grande, Torres/RS",
    lat: -29.3358,
    lng: -49.7271,
    suites: 3,
    banheiros: 4,
    areaPrivativa: 180,
    vagas: 3,
    descricao:
      "Apartamento alto padrão a poucos passos do mar, com varanda integrada de 30 m² e vista para as dunas e os molhes de Torres. Plantas amplas, três suítes, lavabo social e cozinha integrada ao living. Infraestrutura completa de lazer no condomínio: piscina, academia e espaço gourmet. Pronto para morar, com mobiliário planejado.",
    diferenciais: [
      "Vista mar",
      "Varanda integrada",
      "Piscina",
      "Academia",
      "Espaço gourmet",
      "Closet",
    ],
    destaque: false,
    paleta: "areia",
  },
  {
    titulo: "Mansão Bosque do Sol",
    tipo: "Casa",
    finalidade: "Venda",
    preco: 7400000,
    condominio: 3200,
    cidade: "Xangri-lá",
    bairro: "Condomínio Quinta da Barra",
    endereco: "Rua das Araucárias, 12 — Quinta da Barra, Xangri-lá/RS",
    lat: -29.8155,
    lng: -50.0312,
    suites: 6,
    banheiros: 8,
    areaPrivativa: 820,
    areaTerreno: 2200,
    vagas: 8,
    descricao:
      "Mansão de proporções generosas em condomínio fechado de altíssimo padrão. Seis suítes, sendo uma master de 80 m² com closet duplo e terraço privativo. Espaço de lazer completo com piscina aquecida coberta, raia de 25 m, quadra de tênis, espaço gourmet e adega para 600 rótulos. Garagem para oito carros e casa de hóspedes independente. Privacidade e segurança absolutas.",
    diferenciais: [
      "Piscina",
      "Academia",
      "Adega",
      "Espaço gourmet",
      "Automação",
      "Energia solar",
      "Sistema de segurança",
      "Home theater",
      "Closet",
    ],
    destaque: true,
    paleta: "serra",
  },
  {
    titulo: "Penthouse Orla Nobre",
    tipo: "Cobertura",
    finalidade: "Locação",
    preco: 18000,
    condominio: 2800,
    cidade: "Capão da Canoa",
    bairro: "Zona Nova",
    endereco: "Av. Atlântica, 980 — Zona Nova, Capão da Canoa/RS",
    lat: -29.7501,
    lng: -50.0089,
    suites: 4,
    banheiros: 5,
    areaPrivativa: 300,
    vagas: 4,
    descricao:
      "Penthouse de locação para temporada ou anual, totalmente mobiliada e decorada por escritório de interiores. Terraço com piscina de borda infinita, deck em madeira e vista 180° para o mar. Quatro suítes, sistema de som ambiente, automação e serviço de concierge do edifício. Disponível para visitas mediante agendamento.",
    diferenciais: [
      "Vista mar",
      "Frente para o mar",
      "Piscina",
      "Automação",
      "Espaço gourmet",
      "Elevador",
    ],
    destaque: false,
    paleta: "urbano",
  },
];

const LEADS = [
  {
    nome: "Helena Caldas",
    whatsapp: "(51) 99812-4471",
    mensagem: "Tenho interesse na Villa Marítima Aurora. Podemos visitar no sábado?",
    origem: "imovel",
    imovelTitulo: "Villa Marítima Aurora",
    status: "novo",
    lido: false,
  },
  {
    nome: "Ricardo Menezes",
    whatsapp: "(51) 99640-2210",
    mensagem: "Gostaria de saber sobre formas de pagamento da Cobertura Vista Mar.",
    origem: "imovel",
    imovelTitulo: "Cobertura Vista Mar",
    status: "em_contato",
    lido: true,
  },
  {
    nome: "Família Andrade",
    whatsapp: "(54) 99155-7788",
    mensagem: "Procuramos uma casa de 4+ suítes em Atlântida para mudança em janeiro.",
    origem: "contato",
    imovelTitulo: null,
    status: "novo",
    lido: false,
  },
  {
    nome: "Patrícia Lobo",
    whatsapp: "(51) 99303-1199",
    mensagem: "A Penthouse Orla Nobre está disponível para locação anual?",
    origem: "imovel",
    imovelTitulo: "Penthouse Orla Nobre",
    status: "atendido",
    lido: true,
  },
];

async function gerarFotos(idx: number, imovel: SeedImovel) {
  const fotos: { url: string; ordem: number; capa: boolean }[] = [];
  for (let n = 0; n < CENAS_PADRAO.length; n += 1) {
    const { cena, rotulo } = CENAS_PADRAO[n];
    const svg = gerarSVG({
      cena,
      paletaKey: imovel.paleta,
      titulo: n === 0 ? imovel.titulo : rotulo,
      lote: undefined,
    });
    let url: string;
    if (storageHabilitado()) {
      url = await subirParaStorage(
        Buffer.from(svg, "utf8"),
        "image/svg+xml",
        "seed",
      );
    } else {
      const nome = `imovel-${idx + 1}-${n + 1}.svg`;
      await fs.writeFile(path.join(DIR_SEED, nome), svg, "utf8");
      url = `/uploads/seed/${nome}`;
    }
    fotos.push({ url, ordem: n, capa: n === 0 });
  }
  return fotos;
}

async function main() {
  console.log("→ Limpando dados anteriores…");
  await prisma.lead.deleteMany();
  await prisma.foto.deleteMany();
  await prisma.imovel.deleteMany();
  await prisma.admin.deleteMany();

  if (!storageHabilitado()) await fs.mkdir(DIR_SEED, { recursive: true });

  // Admin (corretor)
  const email = process.env.ADMIN_EMAIL || "corretor@guilhermevalim.com.br";
  const senha = process.env.ADMIN_SENHA || "painel123";
  const nome = process.env.ADMIN_NOME || "Guilherme Valim";
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.admin.create({
    data: {
      email,
      senhaHash,
      nome,
      creci: "CRECI 00000-F",
      telefone: "(51) 99999-0000",
      bio: "Especialista em imóveis de alto padrão no litoral do Rio Grande do Sul há mais de 18 anos. Atendimento por curadoria, com discrição e foco em encontrar o endereço certo para cada família.",
      avatarUrl: "/brand/retrato.svg",
    },
  });
  console.log(`✓ Admin criado: ${email} / senha: ${senha}`);

  // Imóveis + fotos
  const idPorTitulo = new Map<string, string>();
  for (let i = 0; i < IMOVEIS.length; i += 1) {
    const imv = IMOVEIS[i];
    const fotos = await gerarFotos(i, imv);
    const criado = await prisma.imovel.create({
      data: {
        slug: slugify(imv.titulo),
        titulo: imv.titulo,
        tipo: imv.tipo,
        finalidade: imv.finalidade,
        preco: imv.preco,
        condominio: imv.condominio ?? null,
        cidade: imv.cidade,
        bairro: imv.bairro,
        endereco: imv.endereco,
        lat: imv.lat,
        lng: imv.lng,
        suites: imv.suites,
        banheiros: imv.banheiros,
        areaPrivativa: imv.areaPrivativa,
        areaTerreno: imv.areaTerreno ?? null,
        vagas: imv.vagas,
        descricao: imv.descricao,
        diferenciais: JSON.stringify(imv.diferenciais),
        destaque: imv.destaque,
        publicado: true,
        fotos: { create: fotos },
      },
    });
    idPorTitulo.set(imv.titulo, criado.id);
    console.log(`✓ Imóvel: ${imv.titulo} (${fotos.length} fotos)`);
  }

  // Leads
  for (const l of LEADS) {
    await prisma.lead.create({
      data: {
        nome: l.nome,
        whatsapp: l.whatsapp,
        mensagem: l.mensagem,
        origem: l.origem,
        status: l.status,
        lido: l.lido,
        imovelId: l.imovelTitulo ? idPorTitulo.get(l.imovelTitulo) ?? null : null,
      },
    });
  }
  console.log(`✓ ${LEADS.length} leads de exemplo criados`);
  console.log("\nSeed concluído. Rode `npm run dev` e acesse /painel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
