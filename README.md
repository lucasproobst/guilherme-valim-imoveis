# Guilherme Valim — Imóveis de Alto Padrão

Site profissional + painel administrativo para um corretor de imóveis de alto
padrão, com a estética de uma **"coleção privada de imóveis"**: fotografia
grande como protagonista, tipografia serifada, acentos em dourado fosco e muito
respiro.

O corretor cadastra e gerencia imóveis (fotos, descrição, localização,
características) pelo painel `/painel`, **sem mexer em código**.

---

## Stack

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- **Prisma + PostgreSQL (Supabase)** — banco gerenciado na nuvem
- **Upload de imagens** isolado em `src/lib/upload.ts` (salva em
  `/public/uploads` no MVP; trocável por Cloudinary/S3)
- **Autenticação** do painel com cookie de sessão assinado (JWT via `jose`) +
  senha com hash (`bcryptjs`). Existe **um único admin** (o corretor)
- Componentes próprios com Tailwind, fontes via `next/font/google`
  (Playfair Display, Jost, Inter)
- Responsivo (mobile-first), acessível (foco visível, `prefers-reduced-motion`)
  e otimizado para SEO (metadata por imóvel, `sitemap.xml`, `robots.txt`,
  Open Graph)

---

## Como rodar

Pré-requisito: **Node 18.18+** (recomendado Node 20).

```bash
# 1. instalar dependências (o postinstall já roda `prisma generate`)
npm install

# 2. configurar o ambiente — defina DATABASE_URL e DIRECT_URL do Supabase
#    (Supabase → Connect → ORMs → Prisma) no arquivo .env
cp .env.example .env

# 3. criar as tabelas no Supabase a partir do schema
npx prisma db push

# 4. gerar as imagens da marca (hero, retrato etc.) e popular o banco
npm run gen:imagens        # gera /public/brand/*.svg
npm run seed               # cria o corretor + 6 imóveis + leads de exemplo

# 5. subir o ambiente de desenvolvimento
npm run dev
```

Acesse:

- Site: <http://localhost:3000>
- Painel: <http://localhost:3000/painel>

### Entrar no painel

As credenciais são criadas pelo `seed` a partir do `.env`:

| Campo | Valor padrão                |
| ----- | --------------------------- |
| E-mail | `corretor@guilhermevalim.com.br`  |
| Senha  | `painel123`                |

> Em produção, **troque** `ADMIN_EMAIL` / `ADMIN_SENHA` no `.env` antes de rodar
> o seed, e gere um `AUTH_SECRET` forte com `openssl rand -base64 32`.

---

## Scripts

| Comando              | O que faz                                              |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Ambiente de desenvolvimento                            |
| `npm run build`      | `prisma generate` + build de produção                  |
| `npm start`          | Servir o build de produção                             |
| `npm run seed`       | Popular o banco (idempotente: limpa e recria)          |
| `npm run gen:imagens`| Gerar os SVGs de identidade em `/public/brand`         |
| `npm run db:push`    | Sincronizar o schema com o Supabase (`prisma db push`) |
| `npm run db:reset`   | Recriar as tabelas do zero (`db push --force-reset`)   |
| `npm run db:studio`  | Abrir o Prisma Studio                                  |

---

## Estrutura

```
src/
  app/
    page.tsx                 # Início (hero, seleção da semana, sobre, CTA)
    imoveis/page.tsx         # Listagem com filtros + paginação
    imoveis/[slug]/page.tsx  # Detalhe (galeria, specs, mapa, contato)
    sobre/  contato/         # Páginas institucionais
    login/                   # Login do painel
    painel/                  # Painel administrativo (protegido)
      layout.tsx             # Sidebar + moldura
      page.tsx               # Visão geral
      imoveis/               # Lista, novo, editar
      leads/  agenda/  perfil/  configuracoes/
    api/                     # leads, auth, upload, imoveis (CRUD)
    sitemap.ts  robots.ts
  components/
    ui/                      # Button, Field, Badge, Eyebrow, Rule, Logo, icons
    site/                    # Header, Footer, PropertyCard, ContactForm, …
    admin/                   # Sidebar, ImovelForm, ImageUploader, …
  lib/                       # db, auth, session, upload, queries, format, …
prisma/
  schema.prisma  seed.ts  imagens.ts  migrations/
public/
  brand/                     # imagens da identidade (geradas)
  uploads/                   # uploads do painel + fotos do seed
```

### Sistema de design

Os tokens ficam em [`tailwind.config.ts`](tailwind.config.ts) e
[`src/app/globals.css`](src/app/globals.css):

- **Cores:** `ink` (#15171A), `ink-2`, `ink-3`, `brass` (#B8924A), `brass-2`
  (#D8B871), `bone` (#F5F1EA), `bone-2`, `stone`, `stone-d`, `line`.
- **Fontes:** `font-display` (Playfair), `font-label` (Jost), `font-sans`
  (Inter).
- **Assinaturas:** classes `.eyebrow`, `.rule` / `.rule-brass`, `.lote-tag`,
  `.accent-italic`, `.panel`.

Os dados do corretor (nome, CRECI, contatos) ficam centralizados em
[`src/lib/constants.ts`](src/lib/constants.ts) → `CORRETOR`. Para usar com outro
corretor, basta editar esse objeto e o `.env`, e rodar o `seed`.

---

## Banco de dados — Supabase (PostgreSQL)

O projeto usa **PostgreSQL no Supabase**, conectado via Prisma. São necessárias
**duas** URLs no `.env` (Supabase → botão **Connect** → aba **ORMs → Prisma**):

```
# pooler em modo transaction (porta 6543) — usado pelo app
DATABASE_URL="postgresql://postgres.<ref>:<senha>@aws-1-<regiao>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
# pooler em modo session (porta 5432) — usado pelas migrations / db push
DIRECT_URL="postgresql://postgres.<ref>:<senha>@aws-1-<regiao>.pooler.supabase.com:5432/postgres"
```

- Se a senha tiver caracteres especiais (ex.: `@`), **codifique na URL** (`@` → `%40`).
- Projetos recentes usam o prefixo **`aws-1-`** no host (os antigos usavam `aws-0-`).
- Criar/atualizar as tabelas: `npx prisma db push`. Popular: `npm run seed`.
- O `directUrl` no [`prisma/schema.prisma`](prisma/schema.prisma) é obrigatório
  porque o pooler em modo transaction não suporta migrations.

O código de dados (`src/lib/queries.ts`) é o mesmo — só a conexão muda.

---

## Trocar upload local → Cloudinary / S3

Toda a camada de upload está isolada em
[`src/lib/upload.ts`](src/lib/upload.ts) com três funções:

- `salvarUpload(file): Promise<string>` — recebe um `File` e devolve a URL pública
- `removerUpload(url): Promise<void>` — remove um arquivo salvo

Para migrar, **reescreva apenas essas funções** (ex.: enviar para o Cloudinary e
retornar a `secure_url`). O resto do app só conhece essas assinaturas. Lembre de
adicionar o domínio remoto em `images.remotePatterns` no
[`next.config.mjs`](next.config.mjs).

---

## Publicar na Vercel

1. Suba o projeto para um repositório Git e importe na Vercel.
2. Configure as variáveis de ambiente (`DATABASE_URL`, `DIRECT_URL`,
   `AUTH_SECRET`, `ADMIN_*`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP`).
3. **Banco:** o Supabase já é gerenciado na nuvem — as mesmas `DATABASE_URL` /
   `DIRECT_URL` funcionam em produção (o pooler em transaction mode é ideal para
   serverless).
4. **Uploads:** o filesystem da Vercel é somente-leitura/efêmero — em produção,
   troque o upload por Cloudinary/S3 ou **Supabase Storage** (a camada está
   isolada em `src/lib/upload.ts`) antes de publicar.
5. O build roda `prisma generate` automaticamente (`npm run build`). Crie as
   tabelas no banco de produção com `npx prisma db push` e, se quiser dados de
   exemplo, `npm run seed` uma vez.

---

## Recursos extras

- **Configurações do site (`/painel/configuracoes`):** o corretor edita
  identidade (nome, marca, subtítulo, assinatura, CRECI, região) e contatos
  (e-mail, telefone, WhatsApp, Instagram, endereço) pelo painel. Os valores
  ficam no modelo `Config` (linha única) e são lidos por `getConfig()` no
  servidor e pelo `ConfigProvider`/`useConfig()` no cliente — refletindo no
  site inteiro (cabeçalho, rodapé, contato…). Campos vazios voltam aos defaults
  de `CORRETOR` em `src/lib/constants.ts`.
- **Meu perfil (`/painel/perfil`):** edição de nome, e-mail, CRECI, telefone,
  bio e foto, além de troca de senha (exige a senha atual).
- **Tour em vídeo:** cada imóvel pode ter um vídeo (MP4/WEBM/MOV, até 80 MB),
  enviado pelo painel e exibido numa moldura moderna na página do imóvel
  (`VideoFrame`). O upload é isolado em `src/lib/upload.ts` (`salvarVideo`); em
  produção na Vercel, prefira enviar vídeos para um storage externo
  (Cloudinary/S3/Mux) — o filesystem é efêmero e há limites de tamanho de
  requisição em serverless.
- **Telefone internacional:** os campos de WhatsApp/telefone usam o componente
  `PhoneInput`, com seletor de país (DDI + bandeira) e máscara automática. O
  valor é gravado como `+DDI número` (ex.: `+55 (51) 99999-0000`), compatível
  com os links `wa.me`.

## Notas

- As fotos do seed e a identidade visual são **SVGs gerados** (sem dependências
  externas). Substitua por fotos reais subindo pelo painel ou trocando os
  arquivos em `/public`.
- O painel é protegido pelo [`middleware.ts`](src/middleware.ts): qualquer rota
  `/painel/**` exige sessão válida.
```
