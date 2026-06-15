/**
 * Versículos bíblicos sobre finanças, trabalho e prosperidade.
 * Um por dia (rotação diária, fuso de São Paulo) — exibidos no bloco
 * "Palavra do dia" da home. Para adicionar/editar frases, basta mexer na lista.
 */

export type Versiculo = { texto: string; referencia: string };

export const VERSICULOS: Versiculo[] = [
  {
    texto: "A bênção do Senhor é que enriquece, e ele não acrescenta dores.",
    referencia: "Provérbios 10:22",
  },
  {
    texto:
      "Lembra-te do Senhor, teu Deus, porque é ele quem te dá força para adquirires riquezas.",
    referencia: "Deuteronômio 8:18",
  },
  {
    texto:
      "Honra ao Senhor com os teus bens e com as primícias de toda a tua renda.",
    referencia: "Provérbios 3:9",
  },
  {
    texto:
      "Os planos do diligente conduzem à abundância, mas a pressa, à pobreza.",
    referencia: "Provérbios 21:5",
  },
  {
    texto: "A mão dos diligentes enriquece.",
    referencia: "Provérbios 10:4",
  },
  {
    texto: "Quem ajunta pouco a pouco terá cada vez mais.",
    referencia: "Provérbios 13:11",
  },
  {
    texto:
      "Confia ao Senhor as tuas obras, e os teus planos serão estabelecidos.",
    referencia: "Provérbios 16:3",
  },
  {
    texto: "Tudo quanto ele faz prosperará.",
    referencia: "Salmos 1:3",
  },
  {
    texto:
      "Sê forte e corajoso; então farás próspero o teu caminho e serás bem-sucedido.",
    referencia: "Josué 1:7-8",
  },
  {
    texto: "Abres a tua mão e satisfazes de boa vontade a todo vivente.",
    referencia: "Salmos 145:16",
  },
  {
    texto:
      "O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória.",
    referencia: "Filipenses 4:19",
  },
  {
    texto:
      "Viste um homem diligente na sua obra? Perante reis será posto, não perante os homens de condição inferior.",
    referencia: "Provérbios 22:29",
  },
  {
    texto: "A alma generosa prosperará, e quem regar também será regado.",
    referencia: "Provérbios 11:25",
  },
  {
    texto: "Riquezas e honra estão comigo, riquezas duráveis e justiça.",
    referencia: "Provérbios 8:18",
  },
  {
    texto:
      "Na sua casa há prosperidade e riquezas, e a sua justiça permanece para sempre.",
    referencia: "Salmos 112:3",
  },
  {
    texto:
      "Com sabedoria se edifica a casa, e com discernimento ela se firma.",
    referencia: "Provérbios 24:3",
  },
  {
    texto:
      "Trazei todos os dízimos à casa do tesouro… e provai-me, diz o Senhor, se não vos abrirei as janelas do céu.",
    referencia: "Malaquias 3:10",
  },
  {
    texto: "Deleita-te no Senhor, e ele satisfará os desejos do teu coração.",
    referencia: "Salmos 37:4",
  },
  {
    texto: "O homem fiel será cheio de bênçãos.",
    referencia: "Provérbios 28:20",
  },
  {
    texto: "Em todo trabalho há proveito.",
    referencia: "Provérbios 14:23",
  },
  {
    texto:
      "Amado, desejo que prosperes em todas as coisas e tenhas saúde, assim como prospera a tua alma.",
    referencia: "3 João 1:2",
  },
  {
    texto:
      "Buscai primeiro o reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    referencia: "Mateus 6:33",
  },
  {
    texto:
      "Dai, e ser-vos-á dado; boa medida, recalcada, sacudida e transbordante vos darão.",
    referencia: "Lucas 6:38",
  },
  {
    texto:
      "Melhor é o pouco com justiça do que a abundância de rendas com injustiça.",
    referencia: "Provérbios 16:8",
  },
  {
    texto: "O Senhor é o meu pastor; nada me faltará.",
    referencia: "Salmos 23:1",
  },
  {
    texto:
      "Não te canses para enriqueceres; confia na tua sabedoria e detém-te.",
    referencia: "Provérbios 23:4",
  },
  {
    texto:
      "A quem Deus deu riquezas e bens, e poder para deles comer, isto é dom de Deus.",
    referencia: "Eclesiastes 5:19",
  },
  {
    texto:
      "Bem-aventurado o homem que teme ao Senhor; haverá prosperidade na sua casa.",
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
