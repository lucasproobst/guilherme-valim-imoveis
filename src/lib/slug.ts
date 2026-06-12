/** Geração de slugs amigáveis a partir do título do imóvel. */

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (marcas combinantes)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove pontuação
    .replace(/\s+/g, "-") // espaços -> hífen
    .replace(/-+/g, "-") // colapsa hifens
    .replace(/^-|-$/g, ""); // tira hifens das pontas
}

/**
 * Garante slug único. Recebe uma função que diz se o slug já existe
 * (consulta no banco) e acrescenta sufixo -2, -3... quando necessário.
 */
export async function slugUnico(
  base: string,
  existe: (slug: string) => Promise<boolean>,
): Promise<string> {
  const raiz = slugify(base) || "imovel";
  let candidato = raiz;
  let n = 2;
  while (await existe(candidato)) {
    candidato = `${raiz}-${n}`;
    n += 1;
  }
  return candidato;
}
