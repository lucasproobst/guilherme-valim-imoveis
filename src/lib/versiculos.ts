/**
 * Versículos bíblicos sobre finanças, trabalho e prosperidade.
 * Versão Nova Tradução na Linguagem de Hoje (NTLH) — linguagem do dia a dia.
 * Um por dia (rotação diária, fuso de São Paulo) — exibidos no bloco
 * "Palavra do dia". Para adicionar/editar frases, basta mexer na lista.
 */

export type Versiculo = { texto: string; referencia: string };

export const VERSICULOS: Versiculo[] = [
  {
    texto:
      "É a bênção do Senhor que torna rica uma pessoa, e ele não lhe acrescenta tristeza.",
    referencia: "Provérbios 10:22",
  },
  {
    texto:
      "Lembrem que é o Senhor, o seu Deus, quem dá a vocês forças para ficarem ricos.",
    referencia: "Deuteronômio 8:18",
  },
  {
    texto:
      "Mostre que você respeita o Senhor, dando a ele uma parte de tudo o que você produz.",
    referencia: "Provérbios 3:9",
  },
  {
    texto:
      "Os planos de quem trabalha com cuidado dão lucro; quem faz tudo às pressas acaba na pobreza.",
    referencia: "Provérbios 21:5",
  },
  {
    texto: "As mãos trabalhadoras trazem riqueza.",
    referencia: "Provérbios 10:4",
  },
  {
    texto: "Quem ajunta dinheiro aos poucos vai ficando rico.",
    referencia: "Provérbios 13:11",
  },
  {
    texto: "Entregue ao Senhor tudo o que você faz, e os seus planos darão certo.",
    referencia: "Provérbios 16:3",
  },
  {
    texto: "Tudo o que essa pessoa faz dá certo.",
    referencia: "Salmos 1:3",
  },
  {
    texto:
      "Tudo o que você fizer dará certo, e você será bem-sucedido por onde for.",
    referencia: "Josué 1:7-8",
  },
  {
    texto:
      "Você abre as mãos e dá a todos os seres vivos tudo o que eles precisam.",
    referencia: "Salmos 145:16",
  },
  {
    texto:
      "E o meu Deus, com a sua maravilhosa riqueza, dará a vocês, por meio de Cristo Jesus, tudo o que vocês precisam.",
    referencia: "Filipenses 4:19",
  },
  {
    texto:
      "Você já viu alguém que faz bem o seu trabalho? Essa pessoa trabalhará para reis, e não para gente sem valor.",
    referencia: "Provérbios 22:29",
  },
  {
    texto:
      "Quem dá com generosidade prospera; quem ajuda os outros também será ajudado.",
    referencia: "Provérbios 11:25",
  },
  {
    texto: "Eu tenho riquezas e honra para dar, prosperidade e sucesso.",
    referencia: "Provérbios 8:18",
  },
  {
    texto:
      "Na casa dessa pessoa há riqueza e prosperidade, e a sua bondade dura para sempre.",
    referencia: "Salmos 112:3",
  },
  {
    texto:
      "As casas são construídas com sabedoria e ficam firmes por meio do bom senso.",
    referencia: "Provérbios 24:3",
  },
  {
    texto:
      "Tragam a décima parte de tudo o que ganham… Ponham-me à prova e vejam se eu não abro as janelas do céu e derramo sobre vocês todo tipo de bênção.",
    referencia: "Malaquias 3:10",
  },
  {
    texto:
      "Encontre a sua alegria no Senhor, e ele realizará os desejos do seu coração.",
    referencia: "Salmos 37:4",
  },
  {
    texto: "Quem é honesto recebe muitas bênçãos.",
    referencia: "Provérbios 28:20",
  },
  {
    texto: "Quem trabalha tem lucro, mas quem só fica falando passa necessidade.",
    referencia: "Provérbios 14:23",
  },
  {
    texto:
      "Meu querido amigo, peço a Deus que tudo corra bem para você e que você tenha boa saúde.",
    referencia: "3 João 1:2",
  },
  {
    texto:
      "Ponham em primeiro lugar na sua vida o Reino de Deus e aquilo que ele quer, e ele dará a vocês todas as outras coisas.",
    referencia: "Mateus 6:33",
  },
  {
    texto:
      "Deem aos outros, e Deus dará a vocês: encherá completamente as suas mãos, com medida sacudida e bem apertada.",
    referencia: "Lucas 6:38",
  },
  {
    texto: "É melhor ter pouco com honestidade do que ganhar muito com injustiça.",
    referencia: "Provérbios 16:8",
  },
  {
    texto: "O Senhor é o meu pastor; nada me faltará.",
    referencia: "Salmos 23:1",
  },
  {
    texto: "Não se canse demais para ficar rico; seja sábio e saiba parar.",
    referencia: "Provérbios 23:4",
  },
  {
    texto:
      "Quando Deus dá a alguém riquezas e bens e ainda permite que essa pessoa os aproveite, isso é um presente de Deus.",
    referencia: "Eclesiastes 5:19",
  },
  {
    texto:
      "Feliz é quem teme o Senhor! Na sua casa há riqueza e prosperidade.",
    referencia: "Salmos 112:1-3",
  },
];

/**
 * Versículo do dia — troca diariamente (índice baseado na data de São Paulo,
 * percorrendo a lista). Recebe a data por parâmetro para facilitar testes.
 */
export function versiculoDoDia(data: Date = new Date()): Versiculo {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [ano, mes, dia] = fmt.format(data).split("-").map(Number);
  const diasDesdeEpoca = Math.floor(Date.UTC(ano, mes - 1, dia) / 86_400_000);
  return VERSICULOS[diasDesdeEpoca % VERSICULOS.length];
}
