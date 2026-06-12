/** Formatadores de exibição (preço, área, datas, telefone). */

/** R$ 2.450.000 — sem centavos, padrão pt-BR. */
export function formatPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

/** R$ 2,4 mi — versão compacta para faixas de autoridade. */
export function formatPrecoCompacto(valor: number): string {
  if (valor >= 1_000_000) {
    const mi = valor / 1_000_000;
    return `R$ ${mi.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  }
  if (valor >= 1_000) {
    return `R$ ${Math.round(valor / 1000)} mil`;
  }
  return formatPreco(valor);
}

/** 320 m² */
export function formatArea(m2?: number | null): string {
  if (!m2 && m2 !== 0) return "—";
  return `${m2.toLocaleString("pt-BR")} m²`;
}

/** "Lote 07" — número de lote sempre com dois dígitos. */
export function formatLote(n: number): string {
  return `Lote ${String(n).padStart(2, "0")}`;
}

/** 10 jun 2026 */
export function formatData(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** 10/06/2026 às 14:32 */
export function formatDataHora(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Monta o link wa.me com mensagem pré-preenchida. */
export function linkWhatsApp(numero: string, mensagem?: string): string {
  const limpo = numero.replace(/\D/g, "");
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${limpo}${texto}`;
}
