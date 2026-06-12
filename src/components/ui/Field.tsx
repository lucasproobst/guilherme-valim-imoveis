import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/* Estilos base de campos — claros (sobre fundo creme/branco). */
const campoBase =
  "w-full rounded-sm border border-line bg-white px-4 py-3 font-sans text-sm " +
  "text-ink placeholder:text-stone transition-colors duration-200 " +
  "focus:border-brass focus-visible:ring-2 focus-visible:ring-brass/40 focus-visible:ring-offset-0 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/* Variante escura para uso dentro de painéis ink (formulários sobre foto/escuro). */
const campoEscuro =
  "w-full rounded-sm border border-ink-3 bg-ink-2 px-4 py-3 font-sans text-sm " +
  "text-bone placeholder:text-stone transition-colors duration-200 " +
  "focus:border-brass focus-visible:ring-2 focus-visible:ring-brass/40";

export function Rotulo({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "label mb-2 block text-[0.66rem] font-medium tracking-label text-stone-d",
        className,
      )}
    >
      {children}
    </label>
  );
}

/** Agrupa rótulo + campo + mensagem de erro. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <Rotulo htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-brass">*</span>}
        </Rotulo>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-stone">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { escuro?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, escuro, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(escuro ? campoEscuro : campoBase, className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  escuro?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, escuro, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        escuro ? campoEscuro : campoBase,
        "resize-y leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  escuro?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, escuro, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        escuro ? campoEscuro : campoBase,
        "cursor-pointer appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10",
        // setinha custom (svg inline) em dourado
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 fill=%22none%22 stroke=%22%23B8924A%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
