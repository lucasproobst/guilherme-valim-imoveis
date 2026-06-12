import type { Metadata } from "next";
import Image from "next/image";
import { SiteShell } from "@/components/site/SiteShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rule } from "@/components/ui/Rule";
import { ContactForm } from "@/components/site/ContactForm";
import {
  IconWhatsApp,
  IconMail,
  IconInstagram,
  IconMapPin,
  IconPhone,
} from "@/components/ui/icons";
import { IMAGENS } from "@/lib/constants";
import { getConfig } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Vamos conversar sobre o seu próximo endereço — por WhatsApp, telefone ou e-mail. Atendimento reservado para a coleção privada de imóveis de alto padrão no litoral do RS.",
};

export const dynamic = "force-dynamic";

export default async function ContatoPage() {
  const c = await getConfig();

  // URLs derivadas do endereço/contato configurados.
  const enderecoEncodado = encodeURIComponent(c.endereco);
  const mapaSrc = `https://www.google.com/maps?q=${enderecoEncodado}&output=embed`;
  const mapaHref = `https://www.google.com/maps?q=${enderecoEncodado}`;
  const whatsappHref = linkWhatsApp(
    c.whatsapp,
    `Olá, ${c.nome}! Gostaria de conversar sobre seus imóveis.`,
  );
  const instagramHref = `https://instagram.com/${c.instagram.replace(/^@/, "")}`;

  return (
    <SiteShell>
      {/* CABEÇALHO */}
      <section className="shell pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="flex max-w-2xl flex-col gap-6 animate-fade-up">
          <Eyebrow>Contato</Eyebrow>
          <h1 className="text-4xl leading-[1.08] text-ink sm:text-5xl md:text-[3.2rem]">
            Vamos conversar sobre o seu próximo{" "}
            <span className="accent-italic">endereço</span>
          </h1>
          <Rule brass />
          <p className="max-w-prose text-base leading-relaxed text-stone-d">
            Cada conversa é reservada. Conte o que procura — ou o imóvel que
            deseja anunciar — e o atendimento começa por uma escuta atenta,
            não por um catálogo.
          </p>
        </div>
      </section>

      {/* DUAS COLUNAS — cartão escuro de contato + formulário claro */}
      <section className="shell pb-16 md:pb-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* ESQUERDA — cartão escuro com foto + canais de contato */}
          <div className="reveal reveal-left dark-section flex flex-col overflow-hidden rounded-sm bg-ink">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={IMAGENS.contato}
                alt="Atendimento Guilherme Valim no litoral do Rio Grande do Sul"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <span className="photo-scrim absolute inset-0" aria-hidden />
            </div>

            <div className="flex flex-1 flex-col gap-8 p-8 md:p-10">
              <div className="flex flex-col gap-3">
                <Eyebrow light>Atendimento direto</Eyebrow>
                <p className="font-display text-2xl text-bone">
                  {c.nome}
                </p>
                <p className="text-[0.9rem] leading-relaxed text-bone/60">
                  {c.subtitulo} · {c.regiao}
                </p>
              </div>

              <Rule />

              <ul className="flex flex-col gap-6">
                {/* WhatsApp */}
                <li>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4"
                    aria-label={`Conversar com ${c.nome} no WhatsApp`}
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-2 transition-colors group-hover:bg-brass group-hover:text-ink">
                      <IconWhatsApp className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="label text-[0.6rem] tracking-label text-bone/45">
                        WhatsApp
                      </span>
                      <span className="text-[0.95rem] text-bone transition-colors group-hover:text-brass-2">
                        {c.telefone}
                      </span>
                    </span>
                  </a>
                </li>

                {/* Telefone */}
                <li>
                  <a
                    href={`tel:+${c.whatsapp}`}
                    className="group flex items-start gap-4"
                    aria-label={`Ligar para ${c.nome}`}
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-2 transition-colors group-hover:bg-brass group-hover:text-ink">
                      <IconPhone className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="label text-[0.6rem] tracking-label text-bone/45">
                        Telefone
                      </span>
                      <span className="text-[0.95rem] text-bone transition-colors group-hover:text-brass-2">
                        {c.telefone}
                      </span>
                    </span>
                  </a>
                </li>

                {/* E-mail */}
                <li>
                  <a
                    href={`mailto:${c.email}`}
                    className="group flex items-start gap-4"
                    aria-label={`Enviar e-mail para ${c.email}`}
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-2 transition-colors group-hover:bg-brass group-hover:text-ink">
                      <IconMail className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="label text-[0.6rem] tracking-label text-bone/45">
                        E-mail
                      </span>
                      <span className="text-[0.95rem] text-bone transition-colors group-hover:text-brass-2">
                        {c.email}
                      </span>
                    </span>
                  </a>
                </li>

                {/* Instagram */}
                <li>
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4"
                    aria-label={`Instagram ${c.instagram}`}
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-2 transition-colors group-hover:bg-brass group-hover:text-ink">
                      <IconInstagram className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="label text-[0.6rem] tracking-label text-bone/45">
                        Instagram
                      </span>
                      <span className="text-[0.95rem] text-bone transition-colors group-hover:text-brass-2">
                        {c.instagram}
                      </span>
                    </span>
                  </a>
                </li>

                {/* Endereço */}
                <li>
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-2">
                      <IconMapPin className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex flex-col">
                      <span className="label text-[0.6rem] tracking-label text-bone/45">
                        Endereço
                      </span>
                      <span className="text-[0.95rem] leading-relaxed text-bone">
                        {c.endereco}
                      </span>
                    </span>
                  </div>
                </li>
              </ul>

              <Rule />

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <span className="label text-[0.62rem] tracking-label text-bone/55">
                  {c.creci}
                </span>
                <span className="label text-[0.62rem] tracking-label text-bone/55">
                  {c.regiao}
                </span>
              </div>
            </div>
          </div>

          {/* DIREITA — formulário em cartão claro */}
          <div className="reveal reveal-right panel flex flex-col gap-7 p-8 md:p-10">
            <div className="flex flex-col gap-3">
              <Eyebrow>Escreva uma mensagem</Eyebrow>
              <h2 className="text-2xl leading-snug text-ink sm:text-[1.7rem]">
                Resposta em até 24h, com a{" "}
                <span className="accent-italic">discrição</span> de sempre
              </h2>
            </div>
            <ContactForm origem="contato" ctaLabel="Enviar mensagem" />
          </div>
        </div>
      </section>

      {/* MAPA — largura total */}
      <section className="shell pb-20 md:pb-28">
        <div className="mb-6 flex flex-col gap-3">
          <Eyebrow>Onde encontrar</Eyebrow>
          <h2 className="text-2xl leading-snug text-ink sm:text-[1.7rem]">
            {c.endereco}
          </h2>
          <Rule brass />
        </div>

        <div className="reveal relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-line md:aspect-[21/8]">
          <iframe
            src={mapaSrc}
            title={`Mapa: ${c.endereco}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <a
          href={mapaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="label link-underline mt-5 inline-flex items-center gap-2 text-[0.68rem] tracking-label text-brass hover:text-ink"
        >
          <IconMapPin className="h-4 w-4" />
          Abrir no Google Maps
        </a>
      </section>
    </SiteShell>
  );
}
