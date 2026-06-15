/**
 * Versículos bíblicos sobre finanças, trabalho e prosperidade.
 * Versão Almeida Revista e Atualizada (RA) — leitura mais clara.
 * Um por dia (rotação diária, fuso de São Paulo) — exibidos no bloco
 * "Palavra do dia". Para adicionar/editar frases, basta mexer na lista.
 */

export type Versiculo = { texto: string; referencia: string };

export const VERSICULOS: Versiculo[] = [
  {
    texto:
      "A bênção do Senhor é que enriquece, e, com ela, não trazem trabalhos.",
    referencia: "Provérbios 10:22",
  },
  {
    texto:
      "Lembra-te do Senhor, teu Deus, porque é ele o que te dá força para adquirires riquezas.",
    referencia: "Deuteronômio 8:18",
  },
  {
    texto:
      "Honra ao Senhor com os teus bens e com as primícias de toda a tua renda.",
    referencia: "Provérbios 3:9",
  },
  {
    texto:
      "Os planos do diligente tendem à abundância, porém todo apressado tende à pobreza.",
    referencia: "Provérbios 21:5",
  },
  {
    texto: "A mão diligente enriquece.",
    referencia: "Provérbios 10:4",
  },
  {
    texto: "Quem ajunta, aos poucos, terá aumento.",
    referencia: "Provérbios 13:11",
  },
  {
    texto:
      "Consagra ao Senhor as tuas obras, e os teus desígnios serão estabelecidos.",
    referencia: "Provérbios 16:3",
  },
  {
    texto: "Tudo quanto ele faz será bem-sucedido.",
    referencia: "Salmos 1:3",
  },
  {
    texto:
      "Sê forte e corajoso; então, farás próspero o teu caminho e serás bem-sucedido.",
    referencia: "Josué 1:7-8",
  },
  {
    texto: "Abres a mão e satisfazes de boa vontade a todo vivente.",
    referencia: "Salmos 145:16",
  },
  {
    texto:
      "O meu Deus, segundo a sua riqueza em glória, há de suprir, em Cristo Jesus, cada uma de vossas necessidades.",
    referencia: "Filipenses 4:19",
  },
  {
    texto:
      "Vês um homem perito na sua obra? Perante reis será posto; não entre a plebe.",
    referencia: "Provérbios 22:29",
  },
  {
    texto:
      "A alma generosa prosperará, e aquele que reparte também será fartado.",
    referencia: "Provérbios 11:25",
  },
  {
    texto: "Riquezas e honra estão comigo, riquezas duráveis e justiça.",
    referencia: "Provérbios 8:18",
  },
  {
    texto:
      "Há prosperidade e riqueza na sua casa, e a sua justiça permanece para sempre.",
    referencia: "Salmos 112:3",
  },
  {
    texto: "Com sabedoria edifica-se a casa, e com inteligência ela se firma.",
    referencia: "Provérbios 24:3",
  },
  {
    texto:
      "Trazei todos os dízimos à casa do tesouro… e provai-me, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu.",
    referencia: "Malaquias 3:10",
  },
  {
    texto: "Agrada-te do Senhor, e ele satisfará os desejos do teu coração.",
    referencia: "Salmos 37:4",
  },
  {
    texto: "O homem fiel será cumulado de bênçãos.",
    referencia: "Provérbios 28:20",
  },
  {
    texto: "Em todo trabalho há proveito.",
    referencia: "Provérbios 14:23",
  },
  {
    texto:
      "Amado, faço votos por tua prosperidade em todas as coisas e que tenhas saúde, assim como é próspera a tua alma.",
    referencia: "3 João 1:2",
  },
  {
    texto:
      "Buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    referencia: "Mateus 6:33",
  },
  {
    texto:
      "Dai, e dar-se-vos-á; boa medida, recalcada, sacudida, transbordante, generosamente vos darão.",
    referencia: "Lucas 6:38",
  },
  {
    texto: "Melhor é o pouco com justiça do que grande renda com injustiça.",
    referencia: "Provérbios 16:8",
  },
  {
    texto: "O Senhor é o meu pastor; nada me faltará.",
    referencia: "Salmos 23:1",
  },
  {
    texto:
      "Não te fatigues para enriqueceres; não te apoies na tua própria inteligência.",
    referencia: "Provérbios 23:4",
  },
  {
    texto:
      "Ao homem a quem Deus conferiu riquezas e bens e deu poder para deles comer… isto é dom de Deus.",
    referencia: "Eclesiastes 5:19",
  },
  {
    texto:
      "Bem-aventurado o homem que teme ao Senhor: há prosperidade e riqueza na sua casa.",
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
