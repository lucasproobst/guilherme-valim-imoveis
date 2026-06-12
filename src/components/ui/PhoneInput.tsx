"use client";

import { useId, useMemo, useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Campo de telefone/celular internacional: seletor de país (DDI) + número
 * formatado conforme a digitação. Controlado (value/onChange).
 *
 * O valor emitido é "+DDI número-formatado" (ex.: "+55 (51) 99999-0000"),
 * compatível com linkWhatsApp() (que remove os não-dígitos para o wa.me).
 */

export type Pais = { code: string; nome: string; ddi: string; flag: string };

export const PAISES: Pais[] = [
  { code: "BR", nome: "Brasil", ddi: "55", flag: "🇧🇷" },
  { code: "PT", nome: "Portugal", ddi: "351", flag: "🇵🇹" },
  { code: "US", nome: "EUA/Canadá", ddi: "1", flag: "🇺🇸" },
  { code: "AR", nome: "Argentina", ddi: "54", flag: "🇦🇷" },
  { code: "UY", nome: "Uruguai", ddi: "598", flag: "🇺🇾" },
  { code: "PY", nome: "Paraguai", ddi: "595", flag: "🇵🇾" },
  { code: "CL", nome: "Chile", ddi: "56", flag: "🇨🇱" },
  { code: "ES", nome: "Espanha", ddi: "34", flag: "🇪🇸" },
  { code: "IT", nome: "Itália", ddi: "39", flag: "🇮🇹" },
  { code: "FR", nome: "França", ddi: "33", flag: "🇫🇷" },
  { code: "GB", nome: "Reino Unido", ddi: "44", flag: "🇬🇧" },
  { code: "DE", nome: "Alemanha", ddi: "49", flag: "🇩🇪" },
  { code: "CH", nome: "Suíça", ddi: "41", flag: "🇨🇭" },
];

const BR = PAISES[0];

/** Formata o número nacional (sem DDI) conforme o país. */
function formatarNacional(digitos: string, pais: Pais): string {
  if (pais.code === "BR") {
    const d = digitos.slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  }
  // Genérico: agrupa em blocos de 3 dígitos.
  const d = digitos.slice(0, 14);
  return d.replace(/(\d{1,3})(?=(\d{3})+$)/g, "$1 ").trim() || d;
}

/** Descobre país + número nacional a partir de um valor salvo. */
function parseValor(valor: string): { pais: Pais; nacional: string } {
  const digitos = (valor || "").replace(/\D/g, "");
  if (!digitos) return { pais: BR, nacional: "" };
  // tenta casar o DDI (mais longo primeiro) — mas só se sobrar número
  const porDDI = [...PAISES].sort((a, b) => b.ddi.length - a.ddi.length);
  for (const p of porDDI) {
    if (digitos.startsWith(p.ddi) && digitos.length > p.ddi.length) {
      return { pais: p, nacional: digitos.slice(p.ddi.length) };
    }
  }
  // sem DDI reconhecido: assume Brasil e trata tudo como número nacional
  return { pais: BR, nacional: digitos };
}

export function PhoneInput({
  value,
  onChange,
  escuro = false,
  id,
  required,
  placeholder,
  className,
}: {
  value: string;
  onChange: (valor: string) => void;
  escuro?: boolean;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;

  // Estado interno inicializado a partir do valor recebido.
  const inicial = useMemo(() => parseValor(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [paisCode, setPaisCode] = useState(inicial.pais.code);
  const [nacional, setNacional] = useState(
    formatarNacional(inicial.nacional, inicial.pais),
  );

  const pais = PAISES.find((p) => p.code === paisCode) ?? BR;

  function emitir(paisAtual: Pais, nacionalFmt: string) {
    const digitosNac = nacionalFmt.replace(/\D/g, "");
    onChange(digitosNac ? `+${paisAtual.ddi} ${nacionalFmt}`.trim() : "");
  }

  function onNumero(e: React.ChangeEvent<HTMLInputElement>) {
    const fmt = formatarNacional(e.target.value.replace(/\D/g, ""), pais);
    setNacional(fmt);
    emitir(pais, fmt);
  }

  function onPais(e: React.ChangeEvent<HTMLSelectElement>) {
    const novo = PAISES.find((p) => p.code === e.target.value) ?? BR;
    setPaisCode(novo.code);
    const fmt = formatarNacional(nacional.replace(/\D/g, ""), novo);
    setNacional(fmt);
    emitir(novo, fmt);
  }

  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-sm border transition-colors focus-within:border-brass focus-within:ring-2 focus-within:ring-brass/40",
        escuro ? "border-ink-3 bg-ink-2" : "border-line bg-white",
        className,
      )}
    >
      <div className="relative shrink-0">
        <select
          aria-label="Código do país (DDI)"
          value={paisCode}
          onChange={onPais}
          className={cn(
            "h-full cursor-pointer appearance-none bg-transparent py-3 pl-3 pr-7 font-sans text-sm focus:outline-none",
            escuro ? "text-bone" : "text-ink",
          )}
        >
          {PAISES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.flag} +{p.ddi}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brass" />
      </div>

      <span
        aria-hidden
        className={cn("w-px self-stretch", escuro ? "bg-ink-3" : "bg-line")}
      />

      <input
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        value={nacional}
        onChange={onNumero}
        placeholder={placeholder ?? (pais.code === "BR" ? "(51) 99999-0000" : "Número")}
        className={cn(
          "min-w-0 flex-1 bg-transparent px-3 py-3 font-sans text-sm focus:outline-none",
          escuro ? "text-bone placeholder:text-stone" : "text-ink placeholder:text-stone",
        )}
      />
    </div>
  );
}
