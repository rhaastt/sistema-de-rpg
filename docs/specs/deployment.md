# Spec — Deploy para produção (Supabase + Next)

Checklist para subir o Celestia em produção. O schema é todo versionado em
`supabase/migrations/`, então a maior parte é reprodutível via `supabase db push`.
Os pontos que **não** são código (URLs de auth, SMTP, segredos) ficam abaixo como
passos de dashboard/ambiente.

> `config.toml` é **só para o ambiente local**. Em produção, auth/SMTP/URLs vivem
> no dashboard do projeto (ou via `supabase config push`, se quiser config-as-code).

---

## 1. Catálogos de referência — ✅ resolvido (vão por migration)

`supabase db push` aplica **migrations**, não seeds. Por isso os catálogos do
ruleset (raças, classes, especializações, perícias) foram **promovidos de seed
para migration** (`0021`–`0023`), pois são *dados de referência exigidos pelo app*.
Resultado: `db push` num projeto novo já popula todo o catálogo. Nada de rodar
seed manualmente em prod. (`supabase/seeds/` ficou vazio; dados de teste, se um dia
existirem, voltam para lá.)

## 2. Criar e linkar o projeto

```bash
npx supabase login                      # ou SUPABASE_ACCESS_TOKEN
# criar no dashboard (org, região, senha do banco) OU:
npx supabase projects create celestia --org-id <org> --region <region> --db-password <pw>
npx supabase link --project-ref <ref>
npx supabase db push                    # aplica 0001..0023 (schema + RLS + grants + bucket + catálogos)
```

`db push` também cria o **bucket `campaign-images`** e suas policies (migration
`0017`) — sem passo manual de storage.

## 3. Auth — URLs (dashboard → Authentication → URL Configuration)

O `config.toml` local usa `site_url = http://127.0.0.1:3000`. Em produção:

- **Site URL** = domínio real (ex.: `https://celestia.app`).
- **Redirect URLs** = o(s) domínio(s) de produção (e preview, se houver).

Sem isso, login/confirmação redirecionam para localhost.

## 4. Auth — e-mails (dashboard → Authentication → Emails / SMTP)

Local usa o **Inbucket** (e-mails não saem de verdade). Produção precisa de **SMTP
real** (SendGrid, Resend, SES…), senão confirmação de conta e recuperação de senha
**não são enviadas**. Decisões a confirmar:

- Manter `enable_confirmations`? (local está `false` — em prod, normalmente `true`.)
- Configurar SMTP do provedor escolhido.

## 5. Segredos e variáveis de ambiente

Nunca commitar. Pegar as chaves no dashboard (Project Settings → API):

| Variável | Onde | Exposição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | deploy do Next | pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | deploy do Next | pública |
| `SUPABASE_SERVICE_ROLE_KEY` | deploy do Next (server) | **secreta** — nunca no cliente |
| Senha do banco | só no `supabase link`/CLI | **secreta** |

A regra do app já garante que o service role só é usado no servidor (ver
`docs/specs/security-rls.md`).

## 6. Next — build

- `next.config.ts` já tem `serverActions.bodySizeLimit: '3mb'` (upload de imagem) —
  vai junto no build, nada a fazer.
- Definir as 3 variáveis `NEXT_PUBLIC_*` / `SERVICE_ROLE_KEY` no provedor (ex.: Vercel).
- Imagens são servidas via URL pública do Storage (`<img>` simples) — se migrar para
  `next/image`, configurar `images.remotePatterns` com o host do Supabase.

## 7. Verificação pós-deploy

```bash
# migrations aplicadas?
npx supabase migration list           # remoto deve bater com local até 0023
# catálogo populado? (via SQL editor do dashboard ou psql)
select count(*) from races;           -- 28
select count(*) from skills;          -- 24
select id, public from storage.buckets where id = 'campaign-images';
```

Fluxo de fumaça: registrar conta → criar campanha (upload de imagem) → criar
personagem (região/raça/atributos/perícias).

---

## Resumo dos pontos de atenção

| # | Item | Estado |
|---|---|---|
| 1 | Seeds não vão no `db push` | ✅ resolvido — catálogos viraram migration |
| 2 | Auth Site/Redirect URLs | passo de dashboard (§3) |
| 3 | SMTP de produção | passo de dashboard (§4) |
| 4 | Segredos (service role, senha) | env do deploy (§5) — nunca commitar |
| 5 | `bodySizeLimit` 3mb | ✅ no `next.config`, vai no build |

Relacionado: [`security-rls.md`](./security-rls.md), [`image-uploads.md`](./image-uploads.md).
