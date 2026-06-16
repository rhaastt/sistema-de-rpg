# Spec — Testes

A seção 13 do `.claude` torna obrigatórios testes de permissões/RLS e dos fluxos
críticos. A estratégia é **teste de integração contra o Supabase local**, porque
os bugs mais sérios do projeto são de RLS e só aparecem no banco real (testes
unitários com mock de Supabase não exercitam policy nenhuma).

## Como rodar

```bash
npm test          # vitest run (uma vez)
npm run test:watch
```

Pré-requisitos:
- Stack local do Supabase no ar (`supabase start` / Docker), DB em `54322`.
- `.env.local` com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Migrations aplicadas (inclui `0015`, necessária para o teardown — ver abaixo).

Sem env do Supabase, os testes se auto-pulam (`describe.skipIf(!hasSupabaseEnv)`),
então não quebram em CI sem banco.

## Estrutura

```
tests/
├── helpers/
│   ├── env.ts   # carrega .env.local em process.env (sem dep de dotenv)
│   └── db.ts    # adminClient, createTestUser, cleanupUsers, loadRuleset
└── integration/
    ├── campaigns.test.ts
    ├── invitations.test.ts
    ├── characters.test.ts
    └── members-visibility.test.ts
```

`vitest.config.ts`: `testTimeout/hookTimeout = 30000` (chamadas de rede) e
`fileParallelism: false` (sequencial — todos compartilham o mesmo banco).

## Helpers (`tests/helpers/db.ts`)

- **`adminClient()`** — cliente `service_role`. Ignora RLS. Uso restrito a
  setup/teardown; **nunca** para validar permissão.
- **`createTestUser(displayName)`** — cria usuário via Auth Admin (o trigger
  `handle_new_user` gera o profile), faz `signInWithPassword` e devolve um cliente
  **autenticado** (sujeito a RLS, como em produção). E-mails: `it-*@celestia.test`.
- **`cleanupUsers(ids)`** — apaga todo o rastro dos usuários em ordem segura de FK
  e remove os usuários. Idempotente.
- **`loadRuleset()`** — ids reais de raça/classe/especialização para montar inputs
  válidos de personagem (inclui helper de Bruxa).

Padrão de cada arquivo: `beforeAll` cria usuários e dados; `afterAll` chama
`cleanupUsers`. Cada execução usa usuários novos, então rodadas não interferem.

## Teardown depende da migration 0015

`service_role` ignora RLS mas **não** ignora GRANT de tabela. Como o app não
concede DELETE a ninguém por design, o teardown via API falhava silenciosamente
com `permission denied for table`. A migration `0015` concede DELETE **apenas ao
service_role**, habilitando a limpeza sem expor exclusão aos clientes. Se você ver
acúmulo de usuários `it-*@celestia.test` no banco, confirme que a 0015 está
aplicada.

## Cobertura atual (mapeada na seção 13)

| Arquivo | Casos |
|---|---|
| `campaigns` | criação (regressão RLS 0012), listagem por participante, RLS de estranho, arquivar/reabrir sem perda, permissão de mestre |
| `invitations` | aceitar (regressão RLS 0013), recusar + histórico (0014), cancelar, duplicidade pendente, não-reutilização, aceite por terceiro |
| `characters` | multiclasse (2 slots), 1 personagem/campanha, especialização ∈ classe, Bruxa (masculino/raça/válido), bloqueio de ficha |
| `members-visibility` | atributos privados (dono/mestre veem, outro jogador não), dados públicos, remoção → personagem morto + acesso revogado, mestre não se remove |

Total: 24 testes.

## Convenções

- Testar **comportamento via RLS** (cliente autenticado), não implementação.
- Toda nova policy ou fluxo crítico entra aqui antes de considerar a tarefa pronta
  (critério de conclusão, seção 16 do `.claude`).
- Não priorizar testes visuais antes das regras de acesso.
