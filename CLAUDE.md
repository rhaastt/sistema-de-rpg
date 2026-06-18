# Celestia — Contexto do projeto

Orientação rápida para esta base de código. Para regras de produto e ruleset, ver
os documentos de referência no fim (este arquivo aponta para eles, não os duplica).

## O que é

App web para mestres e jogadores do RPG **Celestia** gerenciarem **campanhas** e
**fichas de personagem**. Não é mesa virtual (sem mapa/dado/chat/combate). MVP
estrutural: o sistema registra informações; o mestre interpreta as regras.

## Stack

- **Next.js 16** (App Router, Server Actions, `typedRoutes`) · **React 19**
- **TypeScript** estrito (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals/Parameters`)
- **Supabase**: Auth + Postgres (RLS) + Storage · cliente `@supabase/ssr`
- **Tailwind v4** (tokens via `@theme` em `src/app/globals.css`)
- **Zod** (validação) · **Vitest** (testes de integração)

## Como rodar

```bash
npm run dev          # Next dev (http://127.0.0.1:3000 — use 127.0.0.1, não localhost)
npm run type-check   # tsc --noEmit (rodar sempre antes de concluir)
npm test             # Vitest — exige Supabase local no ar
npm run lint
```

Supabase local (Docker): `npx supabase start` (DB 54322, API 54321, Studio 54323).
Variáveis em `.env.local` (gitignored). Os testes se auto-pulam sem env.

## Estrutura (arquitetura por responsabilidade)

```
src/
├── app/              # rotas, páginas, layouts (Next)
├── features/<x>/     # actions · services · repositories · schemas · components
├── domain/<x>/       # entidades e tipos, sem framework
├── infrastructure/   # supabase (clients), repositories, storage
└── shared/           # ui (design system), auth, errors, types
```

Regras: UI não acessa o banco direto; regra de negócio fica em `services`/`domain`,
não em componentes; `domain` não importa Next/Supabase.

## Banco de dados

- Schema 100% versionado em `supabase/migrations/` (`0001`–`0023`). **Nunca** editar
  migration aplicada — criar nova. Detalhes em `.claude` §12.1.
- **Catálogos** (raças, classes, especializações, perícias) são **migrations**
  (`0021`–`0023`), não seeds — assim vão para qualquer ambiente via `db push`.
  `supabase/seeds/` está vazio (reservado para dados de teste, que não usamos).
- **Local ≠ Produção.** Local usa o Supabase em Docker. Produção é o projeto
  Supabase `rpg-celestia` (ref `izbsgleezyqnqkiagejp`, sa-east-1) — migrations já
  aplicadas via `db push`. `.env.local` continua apontando para o local; credenciais
  de prod entram **só** pelo ambiente Production da Vercel. Ver `docs/specs/deployment.md`.

## Design system

`src/shared/ui` — estética pergaminho (medieval retrô). Tokens em `globals.css`
(`bg-page`, `text-content`, `border-stroke`, `rounded-card`, fontes Georgia/Inter).
Componentes: `Button`, `Input`, `Card`, `Panel`, `Frame`, `SelectableCard`, `Tabs`,
`Stepper`, `Avatar`, `ResourceBar`, `ImageUploadField`. Showcase em `/design-system`.
Não criar nova identidade visual nem cores fora dos tokens.

## Status atual

- **Fases 1–3 concluídas**: auth, campanhas, convites, participantes, personagens
  (multiclasse nv1, restrição Bruxa, bloqueio de ficha), histórico, RLS — com suíte
  de integração verde.
- **Fase 4 em andamento**: stats raciais, etapas de Região, Atributos e Perícias na
  criação. Pendências (não inventar): teto por atributo, vida/carga, perícias raciais
  auto-concedidas, "Skills Próprias" da Bruxa, cidades de origem, evolução/XP. Ver
  `docs/specs/phase-4-ruleset.md`.
- Produção: banco configurado; **deploy na Vercel ainda não feito**.

## Convenções importantes

- TypeScript estrito, **sem `any`** sem justificativa. Código em **inglês**, textos de
  UI em **português**.
- Tipos do Supabase são escritos à mão (`src/shared/types/database.ts`); o query
  builder usa o cast `as any` no `insert`/`update` (ver memória `feedback_supabase_types`).
- **Gotcha de RLS**: `insert(...).select()` exige policy de SELECT que aprove a linha
  recém-criada. Ver `docs/specs/security-rls.md` §5 e `.claude` §12.4.
- **Upload de imagem**: sempre WebP até 2 MB, via Storage. Padrão em `docs/specs/image-uploads.md`.
- Toda nova policy/fluxo crítico ganha teste antes de concluir (`docs/specs/testing.md`).

## Segurança

- RLS é a fonte de verdade de autorização — **nunca** desativar para contornar erro.
- **Nunca** usar `service_role` no cliente (o app não usa em runtime). Segredos só em
  env; `.env.local` e chaves nunca commitados.

## Mapa de documentação (fonte de verdade)

- **`.claude`** — especificação/constituição do MVP (escopo, arquitetura, ordem de fases).
- **`compendio-celestia`** — ruleset do Celestia (raças, classes, atributos, perícias,
  fórmulas). **Única fonte de verdade do conteúdo** — não inventar nada fora dele.
- **`docs/specs/`** — `security-rls.md`, `testing.md`, `image-uploads.md`,
  `phase-4-ruleset.md`, `deployment.md`.
- **`README.md`** — visão geral.
