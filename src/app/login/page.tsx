import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Acesso ao painel",
  robots: { index: false, follow: false },
};

/**
 * Tela de login do corretor — fundo ink, cartão claro centralizado.
 * `searchParams` é um objeto síncrono no Next 14.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next =
    typeof searchParams?.next === "string" ? searchParams.next : undefined;

  return (
    <main className="dark-section grid min-h-screen place-items-center bg-ink px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Cartão central claro */}
        <div className="panel animate-fade-up flex flex-col gap-8 p-8 sm:p-10">
          <header className="flex flex-col items-center gap-6 text-center">
            <Logo tone="dark" />
            <div className="flex flex-col items-center gap-2">
              <p className="eyebrow">Área do corretor</p>
              <h1 className="font-display text-2xl tracking-tight text-ink">
                Painel
              </h1>
            </div>
          </header>

          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
