import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Rule } from "@/components/ui/Rule";
import {
  IconWhatsApp,
  IconMail,
  IconInstagram,
  IconMapPin,
} from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/constants";
import { getConfig } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";

/** Rodapé escuro com marca, contatos, navegação e CRECI. */
export async function Footer() {
  const c = await getConfig();
  const ano = 2026; // ano-base do projeto (evita divergência server/client)

  return (
    <footer className="dark-section bg-ink text-bone">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Marca + assinatura */}
          <div>
            <Logo tone="light" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/60">
              Uma coleção privada de imóveis de alto padrão no litoral gaúcho.
              Curadoria, discrição e atendimento dedicado.
            </p>
            <p className="mt-6 font-display text-2xl italic text-brass-2">
              {c.assinatura}
            </p>
            <p className="eyebrow-light mt-2">{c.creci}</p>
          </div>

          {/* Navegação */}
          <div>
            <p className="eyebrow-light mb-5">Navegação</p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-sm text-bone/75 hover:text-bone"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <p className="eyebrow-light mb-5">Contato</p>
            <ul className="flex flex-col gap-4 text-sm text-bone/75">
              <li>
                <a
                  href={linkWhatsApp(c.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-brass-2"
                >
                  <IconWhatsApp className="h-[18px] w-[18px] text-brass" />
                  {c.telefone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-3 hover:text-brass-2"
                >
                  <IconMail className="h-[18px] w-[18px] text-brass" />
                  {c.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconInstagram className="h-[18px] w-[18px] text-brass" />
                {c.instagram}
              </li>
              <li className="flex items-start gap-3">
                <IconMapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brass" />
                <span>{c.endereco}</span>
              </li>
            </ul>
          </div>
        </div>

        <Rule className="my-10 bg-ink-3" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-bone/40 md:flex-row">
          <p>
            © {ano} {c.marca} — {c.subtitulo}. Todos os direitos
            reservados.
          </p>
          <p className="flex items-center gap-4">
            <Link href="/painel" className="link-underline hover:text-bone/70">
              Área do corretor
            </Link>
            <span>·</span>
            <span>{c.regiao}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
