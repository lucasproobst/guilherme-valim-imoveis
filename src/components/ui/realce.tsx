import { Fragment } from "react";

/**
 * Renderiza um texto com trechos entre *asteriscos* em itálico dourado
 * (classe accent-italic). Ex.: "um *privilégio*." → privilégio fica destacado.
 * Funciona em componentes de servidor (sem estado).
 */
export function realce(texto: string) {
  return texto.split(/(\*[^*]+\*)/g).map((parte, i) => {
    if (parte.length > 2 && parte.startsWith("*") && parte.endsWith("*")) {
      return (
        <span key={i} className="accent-italic">
          {parte.slice(1, -1)}
        </span>
      );
    }
    return <Fragment key={i}>{parte}</Fragment>;
  });
}
