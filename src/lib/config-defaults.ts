import { CORRETOR, IMAGENS } from "@/lib/constants";

/**
 * Tipo e defaults da configuração do site — módulo neutro (sem server-only nem
 * use client), para ser importado tanto pelo servidor (config.ts) quanto pelo
 * cliente (config-context.tsx).
 *
 * `retratoUrl` é a foto do corretor (fonte única = avatar do admin), exibida
 * em todo o site: sidebar, home, contato, página do imóvel etc.
 */
export type Stat = { numero: string; rotulo: string };
export type Passo = { titulo: string; texto: string };

export type SiteConfig = {
  nome: string;
  marca: string;
  subtitulo: string;
  assinatura: string;
  creci: string;
  regiao: string;
  email: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  endereco: string;
  retratoUrl: string;
  // Conteúdo editável. Em títulos, *palavra* vira itálico dourado.
  heroEyebrow: string;
  heroTitulo: string;
  heroSubtitulo: string;
  heroImagens: string[];
  numeros: Stat[];
  miniDestaques: Stat[];
  sobreTitulo: string;
  sobreResumo: string;
  bio: string;
  passos: Passo[];
  ctaTitulo: string;
  ctaTexto: string;
};

export const CONFIG_PADRAO: SiteConfig = {
  nome: CORRETOR.nome,
  marca: CORRETOR.marca,
  subtitulo: CORRETOR.subtitulo,
  assinatura: CORRETOR.assinatura,
  creci: CORRETOR.creci,
  regiao: CORRETOR.regiao,
  email: CORRETOR.email,
  telefone: CORRETOR.telefone,
  whatsapp: CORRETOR.whatsapp,
  instagram: CORRETOR.instagram,
  endereco: CORRETOR.endereco,
  retratoUrl: IMAGENS.retrato,
  heroEyebrow: "Coleção privada · Litoral Norte / RS",
  heroTitulo: "Endereços que se habitam como um *privilégio*.",
  heroSubtitulo:
    "Uma seleção criteriosa de residências à beira-mar — escolhidas a dedo, apresentadas com discrição e acompanhadas do começo ao fim.",
  heroImagens: [IMAGENS.hero],
  numeros: [
    { numero: "R$ 480 mi", rotulo: "Em negócios fechados" },
    { numero: "18", rotulo: "Anos de atuação" },
    { numero: "300+", rotulo: "Famílias atendidas" },
    { numero: CORRETOR.creci, rotulo: "Registro profissional" },
  ],
  miniDestaques: [
    { numero: "18", rotulo: "Anos de litoral" },
    { numero: "100%", rotulo: "Atendimento direto" },
    { numero: "Sob medida", rotulo: "Curadoria privada" },
  ],
  sobreTitulo: "Mais do que vender imóveis, *curar* os endereços certos.",
  sobreResumo: `Há quase duas décadas no litoral gaúcho, ${CORRETOR.nome} construiu uma forma de trabalhar pautada pela discrição: poucos imóveis, todos visitados pessoalmente, apresentados apenas a quem busca exatamente aquilo.

Cada negociação é conduzida com o cuidado de quem entende que um endereço de exceção merece um atendimento à altura — do primeiro contato à entrega das chaves.`,
  bio: `São 18 anos dedicados ao litoral do Rio Grande do Sul — tempo suficiente para conhecer cada rua de frente para o mar, cada construtora de confiança e cada detalhe que separa um bom imóvel de um endereço memorável.

O atendimento é por curadoria, não por volume. Você não recebe listas intermináveis: recebe seleção. E recebe discrição — cada cliente, cada proposta e cada visita são tratados com a reserva que negócios desse porte exigem.

A relação não termina na assinatura. Ela continua na confiança de quem volta — e de quem indica.`,
  passos: [
    {
      titulo: "Curadoria",
      texto:
        "Cada imóvel é visitado, fotografado e validado antes de entrar na coleção. Você recebe apenas o que vale o seu tempo.",
    },
    {
      titulo: "Visita exclusiva",
      texto:
        "Agendamento reservado, com acompanhamento pessoal e leitura honesta de cada ambiente — sem roteiro de massa.",
    },
    {
      titulo: "Negociação",
      texto:
        "Condução discreta da proposta à escritura, protegendo seus interesses e o sigilo de cada conversa.",
    },
  ],
  ctaTitulo: "O imóvel certo raramente está à vista. *Vamos encontrá-lo*.",
  ctaTexto:
    "Conte o que procura — ou o que deseja vender — e receba uma seleção discreta, pensada exclusivamente para você.",
};

export const CONFIG_SINGLETON_ID = "singleton";
